package com.studyplanner.service;

import com.studyplanner.dto.request.PomodoroSessionRequest;
import com.studyplanner.dto.response.PomodoroSessionResponse;
import com.studyplanner.enums.SessionType;

import java.util.List;

public interface PomodoroService {

    PomodoroSessionResponse startSession(String email, PomodoroSessionRequest request);

    PomodoroSessionResponse completeSession(String email, Long id);

    List<PomodoroSessionResponse> getHistory(String email, SessionType sessionType, Integer limit);

    void deleteSession(String email, Long id);
}
