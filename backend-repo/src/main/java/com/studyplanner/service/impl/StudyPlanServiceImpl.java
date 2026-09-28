package com.studyplanner.service.impl;

import com.studyplanner.dto.request.StudyPlanRequest;
import com.studyplanner.dto.response.StudyPlanResponse;
import com.studyplanner.entity.StudyPlan;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.StudyPlanRepository;
import com.studyplanner.repository.SubjectRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.StudyPlanService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyPlanServiceImpl implements StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;
    private final UserRepository      userRepository;
    private final SubjectRepository   subjectRepository;

    @Override
    @Transactional
    public StudyPlanResponse create(String email, StudyPlanRequest request) {
        User user = findUser(email);
        Subject subject = resolveSubject(email, request.getSubjectId());
        StudyPlan plan = StudyPlan.builder()
                .user(user)
                .subject(subject)
                .title(request.getTitle())
                .notes(request.getNotes())
                .planDate(request.getPlanDate())
                .durationMinutes(request.getDurationMinutes())
                .isCompleted(false)
                .build();
        return toResponse(studyPlanRepository.save(plan));
    }

    @Override
    public List<StudyPlanResponse> getByDate(String email, LocalDate date) {
        User user = findUser(email);
        return studyPlanRepository.findByUserAndPlanDateOrderByPlanDateAsc(user, date)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<StudyPlanResponse> getByRange(String email, LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("'from' date must not be after 'to' date");
        }
        User user = findUser(email);
        LocalDate start = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate end   = to   != null ? to   : LocalDate.now().plusDays(30);
        return studyPlanRepository.findByUserAndPlanDateBetweenOrderByPlanDateAsc(user, start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public StudyPlanResponse getById(String email, Long id) {
        User user = findUser(email);
        return toResponse(findPlan(id, user));
    }

    @Override
    @Transactional
    public StudyPlanResponse update(String email, Long id, StudyPlanRequest request) {
        User user = findUser(email);
        StudyPlan plan = findPlan(id, user);
        Subject subject = resolveSubject(email, request.getSubjectId());
        plan.setTitle(request.getTitle());
        plan.setNotes(request.getNotes());
        plan.setPlanDate(request.getPlanDate());
        plan.setDurationMinutes(request.getDurationMinutes());
        plan.setSubject(subject);
        if (request.getIsCompleted() != null) {
            plan.setIsCompleted(request.getIsCompleted());
        }
        return toResponse(studyPlanRepository.save(plan));
    }

    @Override
    @Transactional
    public StudyPlanResponse toggleComplete(String email, Long id) {
        User user = findUser(email);
        StudyPlan plan = findPlan(id, user);
        plan.setIsCompleted(!Boolean.TRUE.equals(plan.getIsCompleted()));
        return toResponse(studyPlanRepository.save(plan));
    }

    @Override
    @Transactional
    public void delete(String email, Long id) {
        User user = findUser(email);
        StudyPlan plan = findPlan(id, user);
        studyPlanRepository.delete(plan);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private StudyPlan findPlan(Long id, User user) {
        return studyPlanRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Study plan not found"));
    }

    private Subject resolveSubject(String email, Long subjectId) {
        if (subjectId == null) return null;
        User user = findUser(email);
        return subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private StudyPlanResponse toResponse(StudyPlan p) {
        Subject s = p.getSubject();
        return StudyPlanResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .notes(p.getNotes())
                .planDate(p.getPlanDate())
                .durationMinutes(p.getDurationMinutes())
                .isCompleted(Boolean.TRUE.equals(p.getIsCompleted()))
                .subjectId(s != null ? s.getId() : null)
                .subjectName(s != null ? s.getName() : null)
                .subjectColorHex(s != null ? s.getColorHex() : null)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
