package com.studyplanner.service;

import com.studyplanner.dto.response.StudyStreakResponse;

public interface StreakService {

    StudyStreakResponse getStreak(String email);

    void updateStreak(String email);
}
