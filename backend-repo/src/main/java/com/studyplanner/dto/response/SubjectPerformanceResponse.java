package com.studyplanner.dto.response;

import com.studyplanner.enums.MasteryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectPerformanceResponse {
    private Long subjectId;
    private String subjectName;
    private Double avgScore;
    private Integer tasksCompleted;
    private Integer quizzesTaken;
    private Integer topicsCount;
    private Integer masteredTopicsCount;
    private MasteryStatus masteryStatus;
    private Integer progressPercent;
}
