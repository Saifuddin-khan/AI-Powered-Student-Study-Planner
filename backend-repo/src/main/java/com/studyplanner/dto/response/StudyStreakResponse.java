package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyStreakResponse {
  private Integer currentStreak;
  private Integer longestStreak;
  private java.time.LocalDate lastActivityDate;
  private java.time.LocalDateTime updatedAt;
}