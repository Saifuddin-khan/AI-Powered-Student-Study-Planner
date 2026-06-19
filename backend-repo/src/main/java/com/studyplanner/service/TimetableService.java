package com.studyplanner.service;

import com.studyplanner.dto.request.TimetableRequest;
import com.studyplanner.dto.response.TimetableResponse;

import java.time.DayOfWeek;
import java.util.List;

public interface TimetableService {

    TimetableResponse createSlot(String email, TimetableRequest request);

    List<TimetableResponse> getWeeklySchedule(String email);

    List<TimetableResponse> getSlotsByDay(String email, DayOfWeek day);

    TimetableResponse getSlotById(String email, Long id);

    TimetableResponse updateSlot(String email, Long id, TimetableRequest request);

    void deleteSlot(String email, Long id);
}
