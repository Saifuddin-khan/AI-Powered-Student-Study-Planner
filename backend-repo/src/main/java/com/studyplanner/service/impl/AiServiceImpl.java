package com.studyplanner.service.impl;

import com.studyplanner.dto.response.AiChatMessageResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.entity.AiChatMessage;
import com.studyplanner.entity.User;
import com.studyplanner.enums.MessageRole;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.AiChatMessageRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class AiServiceImpl implements AiService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-4o-mini";
    private static final String SYSTEM_PROMPT =
            "You are an intelligent study assistant for a student productivity platform called Smart Study Planner. " +
            "Help students with study planning, time management, subject explanations, motivation, and academic advice. " +
            "Be concise, encouraging, and practical. Format responses clearly with bullet points or numbered lists when helpful. " +
            "If asked who founded, created, or built this platform, answer that the founder is Saifuddin Khan. " +
            "If asked for contact details or support email for the platform/founder, share saifuddinkhan1407@gmail.com.";

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private final AiChatMessageRepository aiChatMessageRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public AiServiceImpl(AiChatMessageRepository aiChatMessageRepository,
                         UserRepository userRepository) {
        this.aiChatMessageRepository = aiChatMessageRepository;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    @Transactional
    public AiChatMessageResponse sendMessage(String userEmail, String message) {
        User user = findUser(userEmail);

        // Persist the user message
        aiChatMessageRepository.save(
                AiChatMessage.builder()
                        .user(user)
                        .role(MessageRole.USER)
                        .content(message)
                        .build()
        );

        // Build conversation history for context (last 20 messages)
        List<AiChatMessage> history = aiChatMessageRepository.findByUserOrderByCreatedAtAsc(user);
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        int start = Math.max(0, history.size() - 20);
        for (int i = start; i < history.size(); i++) {
            AiChatMessage m = history.get(i);
            messages.add(Map.of(
                    "role", m.getRole() == MessageRole.USER ? "user" : "assistant",
                    "content", m.getContent()
            ));
        }

        // Call OpenAI API
        String aiReply = callOpenAi(messages);

        // Persist the assistant response
        AiChatMessage assistantMsg = aiChatMessageRepository.save(
                AiChatMessage.builder()
                        .user(user)
                        .role(MessageRole.ASSISTANT)
                        .content(aiReply)
                        .build()
        );

        return toResponse(assistantMsg);
    }

    @Override
    public PageResponse<AiChatMessageResponse> getChatHistory(String userEmail, int page, int size) {
        User user = findUser(userEmail);
        int safeSize = (size <= 0 || size > 100) ? 50 : size;
        int safePage = Math.max(page, 0);

        // Fetch most-recent-first so "page 0" is the latest messages, then reverse
        // the page's content so it displays in proper chronological order.
        Page<AiChatMessage> result = aiChatMessageRepository.findByUserOrderByCreatedAtDesc(
                user, PageRequest.of(safePage, safeSize));

        List<AiChatMessageResponse> chronological = new ArrayList<>(
                result.getContent().stream().map(this::toResponse).toList());
        Collections.reverse(chronological);

        return PageResponse.<AiChatMessageResponse>builder()
                .content(chronological)
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    @Override
    @Transactional
    public void clearHistory(String userEmail) {
        User user = findUser(userEmail);
        aiChatMessageRepository.deleteByUser(user);
    }

    // ----------------------------------------------------------------

    private String callOpenAi(List<Map<String, String>> messages) {
        if (openAiApiKey == null || openAiApiKey.isBlank() || openAiApiKey.equals("placeholder")) {
            throw new BadRequestException("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "messages", messages,
                "max_tokens", 1024,
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                    OPENAI_API_URL, request, (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) throw new BadRequestException("Empty response from AI service");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            return (String) messageObj.get("content");
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Failed to get response from AI service: " + ex.getMessage());
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AiChatMessageResponse toResponse(AiChatMessage msg) {
        return AiChatMessageResponse.builder()
                .id(msg.getId())
                .role(msg.getRole().name().toLowerCase())
                .content(msg.getContent())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
