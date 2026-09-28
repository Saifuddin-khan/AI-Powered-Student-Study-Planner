package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class FeatureCostBreakdown {

    private String feature;                 // e.g., "QUIZ_GENERATION"
    private Long callCount;                 // number of times called
    private Long tokensUsed;                // total tokens
    private BigDecimal totalCostUsd;        // total cost in USD
    private Double costPerCall;             // average cost per call
}
