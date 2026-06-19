package com.studyplanner.service;

import com.studyplanner.dto.response.AiChatMessageResponse;
import com.studyplanner.dto.response.PageResponse;

public interface AiService {

    AiChatMessageResponse sendMessage(String userEmail, String message);

    PageResponse<AiChatMessageResponse> getChatHistory(String userEmail, int page, int size);

    void clearHistory(String userEmail);
}
