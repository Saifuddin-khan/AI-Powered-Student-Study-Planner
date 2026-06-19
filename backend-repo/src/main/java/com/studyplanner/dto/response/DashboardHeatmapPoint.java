package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DashboardHeatmapPoint {

    private LocalDate date;
    private int minutes;
}
