package com.studyplanner.dto.request;

import com.studyplanner.enums.SessionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PomodoroSessionRequest {

    @NotNull(message = "Session type is required")
    private SessionType sessionType;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private Long subjectId;
}
