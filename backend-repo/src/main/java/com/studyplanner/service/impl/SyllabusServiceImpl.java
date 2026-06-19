package com.studyplanner.service.impl;

import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.SyllabusFileResponse;
import com.studyplanner.dto.response.SyllabusTopicResponse;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.SyllabusFile;
import com.studyplanner.entity.SyllabusTopic;
import com.studyplanner.entity.User;
import com.studyplanner.enums.SyllabusFileType;
import com.studyplanner.enums.SyllabusStatus;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.SubjectRepository;
import com.studyplanner.repository.SyllabusFileRepository;
import com.studyplanner.repository.SyllabusTopicRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.SyllabusProcessingService;
import com.studyplanner.service.SyllabusService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Set;

@Service
public class SyllabusServiceImpl implements SyllabusService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("application/pdf", "image/jpeg", "image/jpg", "image/png");

    @Value("${app.syllabus.max-file-size-mb:10}")
    private long maxFileSizeMb;

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusFileRepository syllabusFileRepository;
    private final SyllabusTopicRepository syllabusTopicRepository;
    private final SyllabusProcessingService syllabusProcessingService;

    public SyllabusServiceImpl(UserRepository userRepository,
                               SubjectRepository subjectRepository,
                               SyllabusFileRepository syllabusFileRepository,
                               SyllabusTopicRepository syllabusTopicRepository,
                               SyllabusProcessingService syllabusProcessingService) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.syllabusFileRepository = syllabusFileRepository;
        this.syllabusTopicRepository = syllabusTopicRepository;
        this.syllabusProcessingService = syllabusProcessingService;
    }

    @Override
    @Transactional
    public SyllabusFileResponse upload(String email, Long subjectId, MultipartFile file) {
        User user = getUser(email);
        Subject subject = subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        validateFile(file);
        SyllabusFileType fileType = resolveFileType(file);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read the uploaded file");
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        String dataUri = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);

        SyllabusFile syllabusFile = SyllabusFile.builder()
                .user(user)
                .subject(subject)
                .fileName(file.getOriginalFilename())
                .fileType(fileType)
                .fileData(dataUri)
                .status(SyllabusStatus.PENDING)
                .build();
        syllabusFile = syllabusFileRepository.save(syllabusFile);

        syllabusProcessingService.processAsync(syllabusFile.getId(), bytes, fileType);

        return toResponse(syllabusFile, List.of());
    }

    @Override
    public SyllabusFileResponse getById(String email, Long id) {
        User user = getUser(email);
        SyllabusFile syllabusFile = syllabusFileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus file not found"));
        List<SyllabusTopicResponse> topics = syllabusTopicRepository
                .findBySyllabusFileOrderByOrderIndexAsc(syllabusFile)
                .stream().map(this::toTopicResponse).toList();
        return toResponse(syllabusFile, topics);
    }

    @Override
    public PageResponse<SyllabusFileResponse> getBySubject(String email, Long subjectId, int page, int size) {
        User user = getUser(email);
        Subject subject = subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        int safeSize = (size <= 0 || size > 50) ? 20 : size;
        int safePage = Math.max(page, 0);

        Page<SyllabusFile> result = syllabusFileRepository.findBySubjectOrderByCreatedAtDesc(
                subject, PageRequest.of(safePage, safeSize));

        return PageResponse.from(result.map(f -> toResponse(f, List.of())));
    }

    @Override
    @Transactional
    public void delete(String email, Long id) {
        User user = getUser(email);
        SyllabusFile syllabusFile = syllabusFileRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus file not found"));
        syllabusFileRepository.delete(syllabusFile);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded");
        }
        if (file.getSize() > maxFileSizeMb * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed " + maxFileSizeMb + "MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only PDF, JPG, and PNG files are supported");
        }
    }

    private SyllabusFileType resolveFileType(MultipartFile file) {
        String contentType = file.getContentType().toLowerCase();
        if (contentType.equals("application/pdf")) return SyllabusFileType.PDF;
        if (contentType.equals("image/png")) return SyllabusFileType.PNG;
        return SyllabusFileType.JPG;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private SyllabusFileResponse toResponse(SyllabusFile file, List<SyllabusTopicResponse> topics) {
        return SyllabusFileResponse.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .fileType(file.getFileType())
                .status(file.getStatus())
                .errorMessage(file.getErrorMessage())
                .subjectId(file.getSubject() != null ? file.getSubject().getId() : null)
                .subjectName(file.getSubject() != null ? file.getSubject().getName() : null)
                .topics(topics)
                .createdAt(file.getCreatedAt())
                .build();
    }

    private SyllabusTopicResponse toTopicResponse(SyllabusTopic topic) {
        return SyllabusTopicResponse.builder()
                .id(topic.getId())
                .unitName(topic.getUnitName())
                .chapterName(topic.getChapterName())
                .topicName(topic.getTopicName())
                .orderIndex(topic.getOrderIndex())
                .difficultyLevel(topic.getDifficultyLevel())
                .masteryStatus(topic.getMasteryStatus())
                .progressPercent(topic.getProgressPercent())
                .build();
    }
}
