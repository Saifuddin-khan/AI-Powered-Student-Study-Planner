package com.studyplanner.controller;

import com.studyplanner.dto.request.AiChatRequest;
import com.studyplanner.dto.response.AiChatMessageResponse;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    ResponseEntity<ApiResponse<AiChatMessageResponse>> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AiChatRequest request) {
        AiChatMessageResponse response = aiService.sendMessage(userDetails.getUsername(), request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", response));
    }

    @GetMapping("/chat/history")
    ResponseEntity<ApiResponse<PageResponse<AiChatMessageResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<AiChatMessageResponse> history = aiService.getChatHistory(
                userDetails.getUsername(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Chat history fetched successfully", history));
    }

    @DeleteMapping("/chat/history")
    ResponseEntity<ApiResponse<Void>> clearHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        aiService.clearHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Chat history cleared successfully"));
    }
}
