package com.studyplanner.service;

import com.studyplanner.dto.request.StudyPlanRequest;
import com.studyplanner.dto.response.StudyPlanResponse;

import java.time.LocalDate;
import java.util.List;

public interface StudyPlanService {
    StudyPlanResponse create(String email, StudyPlanRequest request);
    List<StudyPlanResponse> getByDate(String email, LocalDate date);
    List<StudyPlanResponse> getByRange(String email, LocalDate from, LocalDate to);
    StudyPlanResponse getById(String email, Long id);
    StudyPlanResponse update(String email, Long id, StudyPlanRequest request);
    StudyPlanResponse toggleComplete(String email, Long id);
    void delete(String email, Long id);
}
