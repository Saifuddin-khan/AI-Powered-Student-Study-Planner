package com.studyplanner.service.impl;

import com.studyplanner.entity.AiUsageLog;
import com.studyplanner.entity.User;
import com.studyplanner.repository.AiUsageLogRepository;
import com.studyplanner.service.AiUsageLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class AiUsageLogServiceImpl implements AiUsageLogService {

    private final AiUsageLogRepository aiUsageLogRepository;

    public AiUsageLogServiceImpl(AiUsageLogRepository aiUsageLogRepository) {
        this.aiUsageLogRepository = aiUsageLogRepository;
    }

    @Override
    public AiUsageLog logAiUsage(
            User user,
            String feature,
            Integer tokensUsed,
            BigDecimal costEstimate,
            String status,
            String errorMessage) {
        try {
            AiUsageLog aiLog = AiUsageLog.builder()
                    .user(user)
                    .feature(feature)
                    .tokensUsed(tokensUsed != null ? tokensUsed : 0)
                    .costEstimate(costEstimate != null ? costEstimate : BigDecimal.ZERO)
                    .status(status)
                    .errorMessage(errorMessage)
                    .build();

            AiUsageLog saved = aiUsageLogRepository.save(aiLog);
            log.info("Logged AI usage - Feature: {}, User: {}, Tokens: {}, Cost: {}, Status: {}",
                    feature, user != null ? user.getId() : "anonymous", tokensUsed, costEstimate, status);
            return saved;
        } catch (Exception e) {
            log.error("Error logging AI usage", e);
            throw e;
        }
    }

    @Override
    public AiUsageLog logSuccess(User user, String feature, Integer tokensUsed, BigDecimal costEstimate) {
        return logAiUsage(user, feature, tokensUsed, costEstimate, "SUCCESS", null);
    }

    @Override
    public AiUsageLog logFailure(User user, String feature, String errorMessage) {
        return logAiUsage(user, feature, 0, BigDecimal.ZERO, "FAILED", errorMessage);
    }

    @Override
    public AiUsageLog logPartialSuccess(
            User user,
            String feature,
            Integer tokensUsed,
            BigDecimal costEstimate,
            String errorMessage) {
        return logAiUsage(user, feature, tokensUsed, costEstimate, "PARTIAL", errorMessage);
    }
}
