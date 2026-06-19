package com.studyplanner.dto.response;

import com.studyplanner.enums.AuditAction;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AuditLogResponse {

    private Long id;
    private String actorEmail;
    private String actorName;
    private AuditAction action;
    private String targetEmail;
    private String details;
    private LocalDateTime createdAt;
}
