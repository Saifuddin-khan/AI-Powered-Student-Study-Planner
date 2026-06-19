package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProgressLogResponse {

    private Long id;
    private LocalDate sessionDate;
    private Integer durationMinutes;
    private String notes;
    private Long subjectId;
    private String subjectName;
    private String subjectColorHex;
    private LocalDateTime createdAt;
}
