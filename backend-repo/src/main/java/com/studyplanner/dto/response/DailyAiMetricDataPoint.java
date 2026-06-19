package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class DailyAiMetricDataPoint {

    private LocalDate date;                 // date for the data point
    private Long requestCount;              // number of requests on that day
    private BigDecimal dailyCostUsd;        // cost for that day
}
