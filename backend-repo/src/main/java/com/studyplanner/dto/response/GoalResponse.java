package com.studyplanner.dto.response;

import com.studyplanner.enums.GoalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class GoalResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDate targetDate;
    private Integer progressPercent;
    private GoalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
