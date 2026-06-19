package com.studyplanner.service;

import com.studyplanner.entity.AiUsageLog;
import com.studyplanner.entity.User;

import java.math.BigDecimal;

public interface AiUsageLogService {

    /**
     * Log an AI API usage event
     */
    AiUsageLog logAiUsage(
            User user,
            String feature,
            Integer tokensUsed,
            BigDecimal costEstimate,
            String status,
            String errorMessage);

    /**
     * Log successful AI API call
     */
    AiUsageLog logSuccess(User user, String feature, Integer tokensUsed, BigDecimal costEstimate);

    /**
     * Log failed AI API call
     */
    AiUsageLog logFailure(User user, String feature, String errorMessage);

    /**
     * Log partial success (partial tokens used but call had issues)
     */
    AiUsageLog logPartialSuccess(
            User user,
            String feature,
            Integer tokensUsed,
            BigDecimal costEstimate,
            String errorMessage);
}
