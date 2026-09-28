package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
  private Long tasksToday;
  private Long overdueCount;
  private Long studyHoursWeek;
  private Long activeGoals;
  private Long completedThisMonth;
  private Long currentStreak;
  private Long longestStreak;
}