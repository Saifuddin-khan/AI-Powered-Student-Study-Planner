package com.studyplanner.service;

import com.studyplanner.dto.request.ProgressLogRequest;
import com.studyplanner.dto.response.ProgressLogResponse;
import com.studyplanner.dto.response.SubjectDurationResponse;

import java.time.LocalDate;
import java.util.List;

public interface ProgressService {

    ProgressLogResponse logSession(String email, ProgressLogRequest request);

    List<ProgressLogResponse> getLogs(String email, Long subjectId, LocalDate from, LocalDate to);

    ProgressLogResponse getLogById(String email, Long id);

    void deleteLog(String email, Long id);

    List<SubjectDurationResponse> getSubjectWiseSummary(String email);
}
