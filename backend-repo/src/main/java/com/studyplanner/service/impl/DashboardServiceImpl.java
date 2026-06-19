package com.studyplanner.service.impl;

import com.studyplanner.dto.response.DashboardHeatmapPoint;
import com.studyplanner.dto.response.DashboardStatsResponse;
import com.studyplanner.entity.StudyStreak;
import com.studyplanner.entity.User;
import com.studyplanner.enums.GoalStatus;
import com.studyplanner.enums.TaskStatus;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.GoalRepository;
import com.studyplanner.repository.ProgressLogRepository;
import com.studyplanner.repository.StudyStreakRepository;
import com.studyplanner.repository.TaskRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    private static final int DEFAULT_HEATMAP_WEEKS = 13;
    private static final int MAX_HEATMAP_WEEKS = 52;

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final ProgressLogRepository progressLogRepository;
    private final StudyStreakRepository studyStreakRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                                TaskRepository taskRepository,
                                GoalRepository goalRepository,
                                ProgressLogRepository progressLogRepository,
                                StudyStreakRepository studyStreakRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
        this.progressLogRepository = progressLogRepository;
        this.studyStreakRepository = studyStreakRepository;
    }

    @Override
    public DashboardStatsResponse getStats(String email) {
        User user = getUser(email);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.withDayOfMonth(1);

        long tasksToday = taskRepository.countByUserAndDueDateAndStatusNot(user, today, TaskStatus.COMPLETED);
        long overdueCount = taskRepository.countByUserAndDueDateBeforeAndStatusNot(user, today, TaskStatus.COMPLETED);

        Integer weeklyMinutes = progressLogRepository.sumDurationBetween(user, weekStart, today);
        double studyHoursWeek = Math.round((weeklyMinutes != null ? weeklyMinutes : 0) / 60.0 * 10) / 10.0;

        long activeGoals = goalRepository.countByUserAndStatus(user, GoalStatus.ACTIVE);
        long completedThisMonth = goalRepository.countByUserAndStatusAndUpdatedAtAfter(
                user, GoalStatus.COMPLETED, monthStart.atStartOfDay());

        StudyStreak streak = studyStreakRepository.findByUser(user).orElse(null);

        return DashboardStatsResponse.builder()
                .tasksToday(tasksToday)
                .overdueCount(overdueCount)
                .studyHoursWeek((long) Math.round(studyHoursWeek))
                .activeGoals(activeGoals)
                .completedThisMonth(completedThisMonth)
                .currentStreak(streak != null ? streak.getCurrentStreak() : 0L)
                .longestStreak(streak != null ? streak.getLongestStreak() : 0L)
                .build();
    }

    @Override
    public List<DashboardHeatmapPoint> getHeatmap(String email, int weeks) {
        User user = getUser(email);
        int safeWeeks = (weeks <= 0 || weeks > MAX_HEATMAP_WEEKS) ? DEFAULT_HEATMAP_WEEKS : weeks;

        LocalDate to = LocalDate.now();
        LocalDate from = to.minusWeeks(safeWeeks).plusDays(1);

        return progressLogRepository.getDailyDurationBetween(user, from, to)
                .stream()
                .map(row -> new DashboardHeatmapPoint((LocalDate) row[0], ((Number) row[1]).intValue()))
                .toList();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
