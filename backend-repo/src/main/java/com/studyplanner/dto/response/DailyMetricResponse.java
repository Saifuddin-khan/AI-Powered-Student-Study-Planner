package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMetricResponse {
    private LocalDate date;
    private Double studyHours;
    private Integer tasksCompleted;
    private Integer quizzesTaken;
}
