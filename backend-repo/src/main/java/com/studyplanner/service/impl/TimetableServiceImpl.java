package com.studyplanner.service.impl;

import com.studyplanner.dto.request.TimetableRequest;
import com.studyplanner.dto.response.TimetableResponse;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.Timetable;
import com.studyplanner.entity.User;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.SubjectRepository;
import com.studyplanner.repository.TimetableRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.TimetableService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

@Service
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public TimetableServiceImpl(TimetableRepository timetableRepository,
                                UserRepository userRepository,
                                SubjectRepository subjectRepository) {
        this.timetableRepository = timetableRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    @Transactional
    public TimetableResponse createSlot(String email, TimetableRequest request) {
        User user = getUser(email);
        validateTimes(request);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        Timetable slot = Timetable.builder()
                .user(user)
                .subject(subject)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .label(request.getLabel())
                .build();

        return toResponse(timetableRepository.save(slot));
    }

    @Override
    public List<TimetableResponse> getWeeklySchedule(String email) {
        User user = getUser(email);
        return timetableRepository.findByUserOrderByDayOfWeekAscStartTimeAsc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<TimetableResponse> getSlotsByDay(String email, DayOfWeek day) {
        User user = getUser(email);
        return timetableRepository.findByUserAndDayOfWeekOrderByStartTimeAsc(user, day)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public TimetableResponse getSlotById(String email, Long id) {
        User user = getUser(email);
        return toResponse(getSlotForUser(id, user));
    }

    @Override
    @Transactional
    public TimetableResponse updateSlot(String email, Long id, TimetableRequest request) {
        User user = getUser(email);
        Timetable slot = getSlotForUser(id, user);
        validateTimes(request);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        slot.setDayOfWeek(request.getDayOfWeek());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setLabel(request.getLabel());
        slot.setSubject(subject);

        return toResponse(timetableRepository.save(slot));
    }

    @Override
    @Transactional
    public void deleteSlot(String email, Long id) {
        User user = getUser(email);
        Timetable slot = getSlotForUser(id, user);
        timetableRepository.delete(slot);
    }

    private void validateTimes(TimetableRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Timetable getSlotForUser(Long id, User user) {
        return timetableRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable slot not found"));
    }

    private Subject resolveSubject(Long subjectId, User user) {
        if (subjectId == null) return null;
        return subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private TimetableResponse toResponse(Timetable slot) {
        return TimetableResponse.builder()
                .id(slot.getId())
                .dayOfWeek(slot.getDayOfWeek())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .label(slot.getLabel())
                .subjectId(slot.getSubject() != null ? slot.getSubject().getId() : null)
                .subjectName(slot.getSubject() != null ? slot.getSubject().getName() : null)
                .subjectColorHex(slot.getSubject() != null ? slot.getSubject().getColorHex() : null)
                .createdAt(slot.getCreatedAt())
                .build();
    }
}
