package com.studyplanner.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
public class TimetableRequest {

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Size(max = 255, message = "Label must not exceed 255 characters")
    private String label;

    private Long subjectId;
}
