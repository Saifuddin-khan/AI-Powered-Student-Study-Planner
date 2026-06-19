package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class AiUsageMetricsResponse {

    private Long totalRequests;                          // total AI API calls
    private Long totalTokensUsed;                        // input + output tokens
    private BigDecimal totalCostUsd;                     // total cost in USD
    private Double successRate;                          // percentage
    private Double failureRate;                          // percentage
    private Map<String, FeatureCostBreakdown> costByFeature;  // breakdown per feature
    private List<DailyAiMetricDataPoint> dailyTrend;    // daily data points

    @Getter
    @Builder
    public static class FeatureCostBreakdown {
        private String feature;                          // feature name (e.g., QUIZ_GENERATION)
        private Long callCount;                          // number of API calls
        private Long tokensUsed;                         // total tokens consumed
        private BigDecimal totalCostUsd;                 // total cost in USD
        private Double costPerCall;                      // average cost per call
    }

    @Getter
    @Builder
    public static class DailyAiMetricDataPoint {
        private LocalDate date;                          // date of the metric
        private Long requestCount;                       // number of requests on this date
        private BigDecimal dailyCostUsd;                 // cost for this date
    }
}
