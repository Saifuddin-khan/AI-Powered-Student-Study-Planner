package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlanProgressResponse {

    private Long planId;
    private String subjectName;
    private LocalDate examDate;
    private int totalTasks;
    private int completedTasks;
    private double progressPercent;
    private String examStatus;  // NOT_GENERATED | GENERATING | READY
    private Long examId;
}
