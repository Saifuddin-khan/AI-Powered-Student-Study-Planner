package com.studyplanner.service.impl;

import com.studyplanner.dto.request.GoalProgressUpdateRequest;
import com.studyplanner.dto.request.GoalRequest;
import com.studyplanner.dto.request.GoalStatusUpdateRequest;
import com.studyplanner.dto.response.GoalResponse;
import com.studyplanner.entity.Goal;
import com.studyplanner.entity.User;
import com.studyplanner.enums.GoalStatus;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.GoalRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.GoalService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalServiceImpl(GoalRepository goalRepository,
                           UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public GoalResponse createGoal(String email, GoalRequest request) {
        User user = getUser(email);

        Goal goal = Goal.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .targetDate(request.getTargetDate())
                .build();

        return toResponse(goalRepository.save(goal));
    }

    @Override
    public List<GoalResponse> getAllGoals(String email, GoalStatus status) {
        User user = getUser(email);

        List<Goal> goals = (status != null)
                ? goalRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status)
                : goalRepository.findByUserOrderByCreatedAtDesc(user);

        return goals.stream().map(this::toResponse).toList();
    }

    @Override
    public GoalResponse getGoalById(String email, Long id) {
        User user = getUser(email);
        return toResponse(getGoalForUser(id, user));
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(String email, Long id, GoalRequest request) {
        User user = getUser(email);
        Goal goal = getGoalForUser(id, user);

        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetDate(request.getTargetDate());

        return toResponse(goalRepository.save(goal));
    }

    @Override
    @Transactional
    public GoalResponse updateProgress(String email, Long id, GoalProgressUpdateRequest request) {
        User user = getUser(email);
        Goal goal = getGoalForUser(id, user);

        goal.setProgressPercent(request.getProgressPercent());

        if (request.getProgressPercent() == 100) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        return toResponse(goalRepository.save(goal));
    }

    @Override
    @Transactional
    public GoalResponse updateStatus(String email, Long id, GoalStatusUpdateRequest request) {
        User user = getUser(email);
        Goal goal = getGoalForUser(id, user);

        goal.setStatus(request.getStatus());

        if (request.getStatus() == GoalStatus.COMPLETED) {
            goal.setProgressPercent(100);
        }

        return toResponse(goalRepository.save(goal));
    }

    @Override
    @Transactional
    public void deleteGoal(String email, Long id) {
        User user = getUser(email);
        Goal goal = getGoalForUser(id, user);
        goalRepository.delete(goal);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Goal getGoalForUser(Long id, User user) {
        return goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
    }

    private GoalResponse toResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetDate(goal.getTargetDate())
                .progressPercent(goal.getProgressPercent())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
