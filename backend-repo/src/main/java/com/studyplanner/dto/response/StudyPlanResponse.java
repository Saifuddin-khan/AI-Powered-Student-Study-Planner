package com.studyplanner.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyPlanResponse {
    private Long    id;
    private String  title;
    private String  notes;
    private LocalDate planDate;
    private Integer durationMinutes;
    @JsonProperty("isCompleted")
    private boolean isCompleted;
    private Long    subjectId;
    private String  subjectName;
    private String  subjectColorHex;
    private LocalDateTime createdAt;
}
