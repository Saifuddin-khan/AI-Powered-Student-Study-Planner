package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AiChatMessageResponse {

    private Long id;
    private String role;
    private String content;
    private LocalDateTime createdAt;
}
