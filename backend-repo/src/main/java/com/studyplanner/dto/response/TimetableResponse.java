package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
public class TimetableResponse {

    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String label;
    private Long subjectId;
    private String subjectName;
    private String subjectColorHex;
    private LocalDateTime createdAt;
}
