package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserAiUsageResponse {

    private Long userId;                    // user ID
    private String userName;                // user's name
    private String userEmail;               // user's email
    private Long totalAiCalls;              // total AI feature calls by this user
    private BigDecimal totalCostUsd;        // total cost attributed to this user
    private LocalDateTime lastActivityAt;   // last time they used AI feature
}
