package com.studyplanner.service;

import com.studyplanner.dto.request.GoalProgressUpdateRequest;
import com.studyplanner.dto.request.GoalRequest;
import com.studyplanner.dto.request.GoalStatusUpdateRequest;
import com.studyplanner.dto.response.GoalResponse;
import com.studyplanner.enums.GoalStatus;

import java.util.List;

public interface GoalService {

    GoalResponse createGoal(String email, GoalRequest request);

    List<GoalResponse> getAllGoals(String email, GoalStatus status);

    GoalResponse getGoalById(String email, Long id);

    GoalResponse updateGoal(String email, Long id, GoalRequest request);

    GoalResponse updateProgress(String email, Long id, GoalProgressUpdateRequest request);

    GoalResponse updateStatus(String email, Long id, GoalStatusUpdateRequest request);

    void deleteGoal(String email, Long id);
}
