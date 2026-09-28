package com.studyplanner.service.impl;

import com.studyplanner.entity.*;
import com.studyplanner.enums.Priority;
import com.studyplanner.enums.TaskSource;
import com.studyplanner.enums.TaskStatus;
import com.studyplanner.repository.*;
import com.studyplanner.service.OpenAiClient;
import com.studyplanner.service.TaskGenerationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TaskGenerationServiceImpl implements TaskGenerationService {

    private final SyllabusFileRepository syllabusFileRepository;
    private final SyllabusTopicRepository syllabusTopicRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final OpenAiClient openAiClient;

    public TaskGenerationServiceImpl(
            SyllabusFileRepository syllabusFileRepository,
            SyllabusTopicRepository syllabusTopicRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            OpenAiClient openAiClient) {
        this.syllabusFileRepository = syllabusFileRepository;
        this.syllabusTopicRepository = syllabusTopicRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.openAiClient = openAiClient;
    }

    @Override
    @Async("syllabusTaskExecutor")
    @Transactional
    public void generateTasksFromSyllabusTopicsAsync(String email, Long syllabusFileId) {
        try {
            log.info("Starting task generation for syllabus: {}", syllabusFileId);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            SyllabusFile syllabusFile = syllabusFileRepository.findById(syllabusFileId)
                    .orElseThrow(() -> new RuntimeException("Syllabus file not found: " + syllabusFileId));

            Subject subject = syllabusFile.getSubject();

            // Get all topics from this syllabus
            List<SyllabusTopic> topics = syllabusTopicRepository.findBySyllabusFileOrderByOrderIndexAsc(syllabusFile);

            if (topics.isEmpty()) {
                log.warn("No topics found for syllabus: {}", syllabusFileId);
                return;
            }

            // Generate exactly 10 tasks
            List<Task> tasks = generateTenTasksFromTopics(user, subject, topics);

            // Save all tasks
            taskRepository.saveAll(tasks);

            log.info("Successfully generated {} tasks for syllabus: {}", tasks.size(), syllabusFileId);

        } catch (Exception e) {
            log.error("Error generating tasks for syllabus: {}", syllabusFileId, e);
        }
    }

    private List<Task> generateTenTasksFromTopics(User user, Subject subject, List<SyllabusTopic> topics) {
        List<Task> tasks = new ArrayList<>();

        // Create exactly 10 tasks
        String topicsText = topics.stream()
                .map(SyllabusTopic::getTopicName)
                .collect(Collectors.joining(", "));

        String prompt = String.format(
                "Given these study topics: %s\n\n" +
                "Generate exactly 10 specific, actionable study tasks that will help a student master these topics. " +
                "Each task should be concrete and measurable. " +
                "Format: one task per line, numbered 1-10.\n\n" +
                "Make tasks progressive from basic understanding to deep mastery.",
                topicsText
        );

        try {
            String aiResponse = openAiClient.completeJson(
                    "You are an expert education planner. Generate exactly 10 numbered study tasks.",
                    prompt,
                    2000
            );
            List<String> taskTitles = parseTasksFromResponse(aiResponse);

            // Ensure exactly 10 tasks
            while (taskTitles.size() < 10) {
                taskTitles.add("Practice task " + (taskTitles.size() + 1));
            }
            taskTitles = taskTitles.stream().limit(10).collect(Collectors.toList());

            Priority[] priorities = {Priority.LOW, Priority.MEDIUM, Priority.HIGH};

            for (int i = 0; i < taskTitles.size(); i++) {
                Task task = Task.builder()
                        .user(user)
                        .subject(subject)
                        .title(taskTitles.get(i))
                        .description("Auto-generated task from syllabus: " + subject.getName())
                        .priority(priorities[i % 3])
                        .status(TaskStatus.PENDING)
                        .source(TaskSource.AI_GENERATED)
                        .estimatedMinutes(45 + (i * 5))
                        .build();

                tasks.add(task);
            }

        } catch (Exception e) {
            log.warn("Error calling AI for task generation, creating default tasks", e);
            // Fallback: create 10 default tasks
            for (int i = 1; i <= 10; i++) {
                Task task = Task.builder()
                        .user(user)
                        .subject(subject)
                        .title("Study task " + i + ": " + subject.getName())
                        .description("Auto-generated study task")
                        .priority(Priority.MEDIUM)
                        .status(TaskStatus.PENDING)
                        .source(TaskSource.AI_GENERATED)
                        .estimatedMinutes(45)
                        .build();

                tasks.add(task);
            }
        }

        return tasks;
    }

    private List<String> parseTasksFromResponse(String response) {
        return Arrays.stream(response.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .filter(line -> line.matches("^\\d+\\..*"))
                .map(line -> line.replaceAll("^\\d+\\.\\s*", "").trim())
                .limit(10)
                .collect(Collectors.toList());
    }
}
