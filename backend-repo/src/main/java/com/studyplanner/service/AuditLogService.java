package com.studyplanner.service;

import com.studyplanner.dto.response.AuditLogResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.enums.AuditAction;

public interface AuditLogService {

    void log(String actorEmail, String actorName, AuditAction action, String targetEmail, String details);

    PageResponse<AuditLogResponse> getLogs(String actorEmail, AuditAction action, int page, int size);
}
