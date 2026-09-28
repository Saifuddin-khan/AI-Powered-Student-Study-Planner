package com.studyplanner.service.impl;

import com.studyplanner.exception.BadRequestException;
import com.studyplanner.service.OpenAiClient;
import com.studyplanner.service.AiUsageLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OpenAiClientImpl implements OpenAiClient {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-4o-mini";

    @Value("${openai.api.key}")
    private String openAiApiKey;

    @Value("${openai.cost-per-1k-input-tokens:0.00015}")
    private Double inputTokenCost;

    @Value("${openai.cost-per-1k-output-tokens:0.0006}")
    private Double outputTokenCost;

    private final RestTemplate restTemplate = new RestTemplate();
    private final AiUsageLogService aiUsageLogService;

    public OpenAiClientImpl(AiUsageLogService aiUsageLogService) {
        this.aiUsageLogService = aiUsageLogService;
    }

    @Override
    public String completeJson(String systemPrompt, String userPrompt, int maxTokens) {
        if (openAiApiKey == null || openAiApiKey.isBlank() || openAiApiKey.equals("placeholder")) {
            throw new BadRequestException("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        );

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "messages", messages,
                "max_tokens", maxTokens,
                "temperature", 0.3,
                "response_format", Map.of("type", "json_object")
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            long startTime = System.currentTimeMillis();
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                    OPENAI_API_URL, request, (Class<Map<String, Object>>) (Class<?>) Map.class);
            long duration = System.currentTimeMillis() - startTime;

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) throw new BadRequestException("Empty response from AI service");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) messageObj.get("content");

            // Extract usage information from response
            @SuppressWarnings("unchecked")
            Map<String, Object> usage = (Map<String, Object>) responseBody.get("usage");
            Integer inputTokens = usage != null ? ((Number) usage.get("prompt_tokens")).intValue() : 0;
            Integer outputTokens = usage != null ? ((Number) usage.get("completion_tokens")).intValue() : 0;
            Integer totalTokens = inputTokens + outputTokens;

            // Calculate cost
            BigDecimal inputCost = BigDecimal.valueOf(inputTokens).multiply(BigDecimal.valueOf(inputTokenCost)).divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP);
            BigDecimal outputCost = BigDecimal.valueOf(outputTokens).multiply(BigDecimal.valueOf(outputTokenCost)).divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP);
            BigDecimal totalCost = inputCost.add(outputCost);

            log.debug("OpenAI API call completed in {}ms - Tokens: {}, Cost: ${}", duration, totalTokens, totalCost);

            return content;
        } catch (Exception ex) {
            log.error("OpenAI API call failed: {}", ex.getMessage());
            throw new BadRequestException("Failed to get a structured response from the AI service: " + ex.getMessage());
        }
    }
}
