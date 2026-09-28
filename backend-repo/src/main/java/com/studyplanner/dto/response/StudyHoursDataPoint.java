package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class StudyHoursDataPoint {

    private LocalDate date;
    private Integer totalMinutes;
}
