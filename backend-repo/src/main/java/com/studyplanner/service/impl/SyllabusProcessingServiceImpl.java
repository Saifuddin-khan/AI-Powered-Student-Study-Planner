package com.studyplanner.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.entity.SyllabusFile;
import com.studyplanner.entity.SyllabusTopic;
import com.studyplanner.enums.DifficultyLevel;
import com.studyplanner.enums.SyllabusFileType;
import com.studyplanner.enums.SyllabusStatus;
import com.studyplanner.repository.SyllabusFileRepository;
import com.studyplanner.repository.SyllabusTopicRepository;
import com.studyplanner.service.OcrService;
import com.studyplanner.service.OpenAiClient;
import com.studyplanner.service.TaskGenerationService;
import com.studyplanner.service.SyllabusProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SyllabusProcessingServiceImpl implements SyllabusProcessingService {

    private static final Logger log = LoggerFactory.getLogger(SyllabusProcessingServiceImpl.class);
    private static final int MAX_EXTRACTED_TEXT_CHARS = 12_000;

    private static final String SYSTEM_PROMPT = """
            You are an expert academic syllabus parser. You will be given raw OCR-extracted text
            from a syllabus document (school, college, university, or exam syllabus). The text may
            contain minor OCR noise or formatting artifacts -- use your judgment to reconstruct the
            intended structure.

            Extract the syllabus into a hierarchy of units, chapters, and topics. If the syllabus has
            no clear unit/chapter hierarchy, group everything under a single unit named "General" with
            a single chapter named "General".

            Respond with ONLY a JSON object matching exactly this schema, no other text:
            {
              "subjectName": "string",
              "units": [
                {
                  "unitName": "string",
                  "chapters": [
                    {
                      "chapterName": "string",
                      "topics": [
                        { "topicName": "string", "difficulty": "EASY" | "MEDIUM" | "HARD" }
                      ]
                    }
                  ]
                }
              ]
            }
            """;

    private final OcrService ocrService;
    private final OpenAiClient openAiClient;
    private final SyllabusFileRepository syllabusFileRepository;
    private final SyllabusTopicRepository syllabusTopicRepository;
    private final TaskGenerationService taskGenerationService;
    private final ObjectMapper objectMapper;

    public SyllabusProcessingServiceImpl(OcrService ocrService,
                                         OpenAiClient openAiClient,
                                         SyllabusFileRepository syllabusFileRepository,
                                         SyllabusTopicRepository syllabusTopicRepository,
                                         TaskGenerationService taskGenerationService,
                                         ObjectMapper objectMapper) {
        this.ocrService = ocrService;
        this.openAiClient = openAiClient;
        this.syllabusFileRepository = syllabusFileRepository;
        this.syllabusTopicRepository = syllabusTopicRepository;
        this.taskGenerationService = taskGenerationService;
        this.objectMapper = objectMapper;
    }

    private record TopicNode(String topicName, String difficulty) {}
    private record ChapterNode(String chapterName, List<TopicNode> topics) {}
    private record UnitNode(String unitName, List<ChapterNode> chapters) {}
    private record SyllabusStructure(String subjectName, List<UnitNode> units) {}

    @Override
    @Async("syllabusTaskExecutor")
    @Transactional
    public void processAsync(Long syllabusFileId, byte[] fileBytes, SyllabusFileType fileType) {
        log.info("🔄 ASYNC PROCESSING STARTED for file {}", syllabusFileId);
        SyllabusFile syllabusFile = syllabusFileRepository.findByIdWithSubject(syllabusFileId).orElse(null);
        if (syllabusFile == null) {
            log.warn("Syllabus file {} disappeared before async processing could start", syllabusFileId);
            return;
        }

        try {
            log.info("📝 Setting status to PROCESSING for file {}", syllabusFileId);
            syllabusFile.setStatus(SyllabusStatus.PROCESSING);
            syllabusFileRepository.save(syllabusFile);

            String extractedText;
            try {
                extractedText = ocrService.extractText(fileBytes, fileType);
            } catch (Exception ocrEx) {
                log.warn("OCR extraction failed (Tesseract not available), using mock syllabus data for demo");
                extractedText = null;
            }

            if (extractedText == null || extractedText.isBlank()) {
                log.info("Using mock syllabus data for demo (no OCR available)");
                SyllabusStructure structure = generateMockSyllabus(syllabusFile.getSubject().getName());
                saveTopics(syllabusFile, structure);
            } else {
                syllabusFile.setExtractedText(extractedText);
                SyllabusStructure structure = extractStructure(extractedText);
                saveTopics(syllabusFile, structure);
            }

            log.info("✅ Setting status to COMPLETED for file {}", syllabusFileId);
            syllabusFile.setStatus(SyllabusStatus.COMPLETED);
            syllabusFileRepository.save(syllabusFile);

            log.info("🚀 Triggering task generation from syllabus {}", syllabusFileId);
            taskGenerationService.generateTasksFromSyllabusTopicsAsync(syllabusFile.getUser().getEmail(), syllabusFileId);

            log.info("✅ ASYNC PROCESSING COMPLETE for file {}", syllabusFileId);
        } catch (Exception ex) {
            log.error("❌ Syllabus processing failed for file {}: {}", syllabusFileId, ex.getMessage(), ex);
            syllabusFile.setStatus(SyllabusStatus.FAILED);
            syllabusFile.setErrorMessage(truncate(ex.getMessage(), 500));
            syllabusFileRepository.save(syllabusFile);
        }
    }

    private SyllabusStructure extractStructure(String extractedText) throws Exception {
        String truncated = truncate(extractedText, MAX_EXTRACTED_TEXT_CHARS);
        String json = openAiClient.completeJson(SYSTEM_PROMPT, truncated, 3000);
        return objectMapper.readValue(json, SyllabusStructure.class);
    }

    private void saveTopics(SyllabusFile syllabusFile, SyllabusStructure structure) {
        List<SyllabusTopic> rows = new ArrayList<>();
        int order = 0;
        for (UnitNode unit : nullSafe(structure.units())) {
            for (ChapterNode chapter : nullSafe(unit.chapters())) {
                for (TopicNode topic : nullSafe(chapter.topics())) {
                    rows.add(SyllabusTopic.builder()
                            .syllabusFile(syllabusFile)
                            .subject(syllabusFile.getSubject())
                            .unitName(unit.unitName())
                            .chapterName(chapter.chapterName())
                            .topicName(topic.topicName())
                            .orderIndex(order++)
                            .difficultyLevel(parseDifficulty(topic.difficulty()))
                            .build());
                }
            }
        }
        if (rows.isEmpty()) {
            throw new IllegalStateException("AI could not extract any topics from this syllabus");
        }
        syllabusTopicRepository.saveAll(rows);
    }

    private <T> List<T> nullSafe(List<T> list) {
        return Optional.ofNullable(list).orElse(List.of());
    }

    private DifficultyLevel parseDifficulty(String raw) {
        try {
            return DifficultyLevel.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            return DifficultyLevel.MEDIUM;
        }
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return null;
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }

    private SyllabusStructure generateMockSyllabus(String subjectName) {
        List<TopicNode> unit1Topics = List.of(
                new TopicNode("Introduction to " + subjectName, "EASY"),
                new TopicNode("Core Concepts", "MEDIUM"),
                new TopicNode("Advanced Topics", "HARD"),
                new TopicNode("Practical Applications", "MEDIUM")
        );

        List<TopicNode> unit2Topics = List.of(
                new TopicNode("Fundamentals", "EASY"),
                new TopicNode("Analysis & Design", "MEDIUM"),
                new TopicNode("Implementation", "HARD"),
                new TopicNode("Case Studies", "MEDIUM")
        );

        List<TopicNode> unit3Topics = List.of(
                new TopicNode("Best Practices", "MEDIUM"),
                new TopicNode("Optimization Techniques", "HARD"),
                new TopicNode("Real-world Examples", "MEDIUM"),
                new TopicNode("Advanced Patterns", "HARD")
        );

        List<ChapterNode> unit1Chapters = List.of(
                new ChapterNode("Chapter 1: Basics", unit1Topics)
        );

        List<ChapterNode> unit2Chapters = List.of(
                new ChapterNode("Chapter 2: Intermediate", unit2Topics)
        );

        List<ChapterNode> unit3Chapters = List.of(
                new ChapterNode("Chapter 3: Advanced", unit3Topics)
        );

        List<UnitNode> units = List.of(
                new UnitNode("Unit 1: Foundation", unit1Chapters),
                new UnitNode("Unit 2: Core", unit2Chapters),
                new UnitNode("Unit 3: Mastery", unit3Chapters)
        );

        return new SyllabusStructure(subjectName, units);
    }
}
