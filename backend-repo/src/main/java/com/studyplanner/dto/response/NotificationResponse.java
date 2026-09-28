package com.studyplanner.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.studyplanner.enums.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
}
