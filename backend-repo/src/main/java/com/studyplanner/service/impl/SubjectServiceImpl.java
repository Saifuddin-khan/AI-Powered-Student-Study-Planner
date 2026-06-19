package com.studyplanner.service.impl;

import com.studyplanner.dto.request.SubjectRequest;
import com.studyplanner.dto.response.SubjectResponse;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.*;
import com.studyplanner.service.SubjectService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final TimetableRepository timetableRepository;
    private final ProgressLogRepository progressLogRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final SyllabusFileRepository syllabusFileRepository;

    public SubjectServiceImpl(SubjectRepository subjectRepository,
                              UserRepository userRepository,
                              TaskRepository taskRepository,
                              NoteRepository noteRepository,
                              TimetableRepository timetableRepository,
                              ProgressLogRepository progressLogRepository,
                              PomodoroSessionRepository pomodoroSessionRepository,
                              SyllabusFileRepository syllabusFileRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
        this.timetableRepository = timetableRepository;
        this.progressLogRepository = progressLogRepository;
        this.pomodoroSessionRepository = pomodoroSessionRepository;
        this.syllabusFileRepository = syllabusFileRepository;
    }

    @Override
    @Transactional
    public SubjectResponse createSubject(String email, SubjectRequest request) {
        User user = getUser(email);

        if (subjectRepository.existsByNameAndUser(request.getName(), user)) {
            throw new BadRequestException("A subject with this name already exists");
        }

        Subject subject = Subject.builder()
                .user(user)
                .name(request.getName())
                .colorHex(request.getColorHex())
                .description(request.getDescription())
                .build();

        return toResponse(subjectRepository.save(subject));
    }

    @Override
    public List<SubjectResponse> getAllSubjects(String email) {
        User user = getUser(email);
        return subjectRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SubjectResponse getSubjectById(String email, Long id) {
        User user = getUser(email);
        Subject subject = getSubjectForUser(id, user);
        return toResponse(subject);
    }

    @Override
    @Transactional
    public SubjectResponse updateSubject(String email, Long id, SubjectRequest request) {
        User user = getUser(email);
        Subject subject = getSubjectForUser(id, user);

        if (subjectRepository.existsByNameAndUserAndIdNot(request.getName(), user, id)) {
            throw new BadRequestException("A subject with this name already exists");
        }

        subject.setName(request.getName());
        subject.setColorHex(request.getColorHex());
        subject.setDescription(request.getDescription());

        return toResponse(subjectRepository.save(subject));
    }

    @Override
    @Transactional
    public void deleteSubject(String email, Long id) {
        User user = getUser(email);
        Subject subject = getSubjectForUser(id, user);

        // Cascade delete all related entities
        taskRepository.deleteBySubject(subject);
        noteRepository.deleteBySubject(subject);
        timetableRepository.deleteBySubject(subject);
        progressLogRepository.deleteBySubject(subject);
        pomodoroSessionRepository.deleteBySubject(subject);
        syllabusFileRepository.deleteBySubject(subject);

        subjectRepository.delete(subject);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Subject getSubjectForUser(Long id, User user) {
        return subjectRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private SubjectResponse toResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .name(subject.getName())
                .colorHex(subject.getColorHex())
                .description(subject.getDescription())
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .build();
    }
}
