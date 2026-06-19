package com.studyplanner.service.impl;

import com.studyplanner.dto.request.PomodoroSessionRequest;
import com.studyplanner.dto.response.PomodoroSessionResponse;
import com.studyplanner.entity.PomodoroSession;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import com.studyplanner.enums.SessionType;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.PomodoroSessionRepository;
import com.studyplanner.repository.SubjectRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.PomodoroService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

@Service
public class PomodoroServiceImpl implements PomodoroService {

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public PomodoroServiceImpl(PomodoroSessionRepository pomodoroSessionRepository,
                               UserRepository userRepository,
                               SubjectRepository subjectRepository) {
        this.pomodoroSessionRepository = pomodoroSessionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    @Transactional
    public PomodoroSessionResponse startSession(String email, PomodoroSessionRequest request) {
        User user = getUser(email);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .subject(subject)
                .sessionType(request.getSessionType())
                .durationMinutes(request.getDurationMinutes())
                .startedAt(LocalDateTime.now())
                .build();

        return toResponse(pomodoroSessionRepository.save(session));
    }

    @Override
    @Transactional
    public PomodoroSessionResponse completeSession(String email, Long id) {
        User user = getUser(email);
        PomodoroSession session = getSessionForUser(id, user);

        if (session.isCompleted()) {
            throw new BadRequestException("Session is already completed");
        }

        session.setCompleted(true);
        session.setCompletedAt(LocalDateTime.now());

        return toResponse(pomodoroSessionRepository.save(session));
    }

    @Override
    public List<PomodoroSessionResponse> getHistory(String email, SessionType sessionType, Integer limit) {
        User user = getUser(email);

        List<PomodoroSession> sessions = (sessionType != null)
                ? pomodoroSessionRepository.findByUserAndSessionTypeOrderByStartedAtDesc(user, sessionType)
                : pomodoroSessionRepository.findByUserOrderByStartedAtDesc(user);

        Stream<PomodoroSession> stream = sessions.stream();
        if (limit != null && limit > 0) {
            stream = stream.limit(limit);
        }

        return stream.map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void deleteSession(String email, Long id) {
        User user = getUser(email);
        PomodoroSession session = getSessionForUser(id, user);
        pomodoroSessionRepository.delete(session);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private PomodoroSession getSessionForUser(Long id, User user) {
        return pomodoroSessionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Pomodoro session not found"));
    }

    private Subject resolveSubject(Long subjectId, User user) {
        if (subjectId == null) return null;
        return subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private PomodoroSessionResponse toResponse(PomodoroSession session) {
        return PomodoroSessionResponse.builder()
                .id(session.getId())
                .sessionType(session.getSessionType())
                .durationMinutes(session.getDurationMinutes())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .isCompleted(session.isCompleted())
                .subjectId(session.getSubject() != null ? session.getSubject().getId() : null)
                .subjectName(session.getSubject() != null ? session.getSubject().getName() : null)
                .subjectColorHex(session.getSubject() != null ? session.getSubject().getColorHex() : null)
                .build();
    }
}
