package com.studyplanner.service.impl;

import com.studyplanner.dto.request.ProgressLogRequest;
import com.studyplanner.dto.response.ProgressLogResponse;
import com.studyplanner.dto.response.SubjectDurationResponse;
import com.studyplanner.entity.ProgressLog;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.ProgressLogRepository;
import com.studyplanner.repository.SubjectRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.ProgressService;
import com.studyplanner.service.StreakService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProgressServiceImpl implements ProgressService {

    private final ProgressLogRepository progressLogRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StreakService streakService;

    public ProgressServiceImpl(ProgressLogRepository progressLogRepository,
                               UserRepository userRepository,
                               SubjectRepository subjectRepository,
                               StreakService streakService) {
        this.progressLogRepository = progressLogRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.streakService = streakService;
    }

    @Override
    @Transactional
    public ProgressLogResponse logSession(String email, ProgressLogRequest request) {
        User user = getUser(email);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        ProgressLog log = ProgressLog.builder()
                .user(user)
                .subject(subject)
                .sessionDate(request.getSessionDate())
                .durationMinutes(request.getDurationMinutes())
                .notes(request.getNotes())
                .build();

        ProgressLogResponse response = toResponse(progressLogRepository.save(log));
        streakService.updateStreak(email);
        return response;
    }

    @Override
    public List<ProgressLogResponse> getLogs(String email, Long subjectId,
                                             LocalDate from, LocalDate to) {
        User user = getUser(email);
        return progressLogRepository.findByUserWithFilters(user, subjectId, from, to)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ProgressLogResponse getLogById(String email, Long id) {
        User user = getUser(email);
        return toResponse(getLogForUser(id, user));
    }

    @Override
    @Transactional
    public void deleteLog(String email, Long id) {
        User user = getUser(email);
        ProgressLog log = getLogForUser(id, user);
        progressLogRepository.delete(log);
    }

    @Override
    public List<SubjectDurationResponse> getSubjectWiseSummary(String email) {
        User user = getUser(email);
        return progressLogRepository.getSubjectWiseDuration(user)
                .stream()
                .map(row -> new SubjectDurationResponse(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).intValue()
                ))
                .toList();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProgressLog getLogForUser(Long id, User user) {
        return progressLogRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Progress log not found"));
    }

    private Subject resolveSubject(Long subjectId, User user) {
        if (subjectId == null) return null;
        return subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private ProgressLogResponse toResponse(ProgressLog log) {
        return ProgressLogResponse.builder()
                .id(log.getId())
                .sessionDate(log.getSessionDate())
                .durationMinutes(log.getDurationMinutes())
                .notes(log.getNotes())
                .subjectId(log.getSubject() != null ? log.getSubject().getId() : null)
                .subjectName(log.getSubject() != null ? log.getSubject().getName() : null)
                .subjectColorHex(log.getSubject() != null ? log.getSubject().getColorHex() : null)
                .createdAt(log.getCreatedAt())
                .build();
    }
}
