package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorLogResponse {

    private Long logId;                     // AI usage log ID
    private LocalDateTime timestamp;        // when error occurred
    private String feature;                 // feature that failed
    private String errorMessage;            // error details
    private Long userId;                    // user ID (nullable)
    private String userName;                // user name (nullable)
    private String status;                  // "FAILED" or "PARTIAL"
}
