package com.studyplanner.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.studyplanner.enums.SessionType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PomodoroSessionResponse {

    private Long id;
    private SessionType sessionType;
    private Integer durationMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    @JsonProperty("isCompleted")
    private boolean isCompleted;
    private Long subjectId;
    private String subjectName;
    private String subjectColorHex;
}
