package com.studyplanner.service.impl;

import com.studyplanner.dto.response.AuditLogResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.entity.AuditLog;
import com.studyplanner.enums.AuditAction;
import com.studyplanner.repository.AuditLogRepository;
import com.studyplanner.service.AuditLogService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void log(String actorEmail, String actorName, AuditAction action, String targetEmail, String details) {
        AuditLog entry = AuditLog.builder()
                .actorEmail(actorEmail)
                .actorName(actorName)
                .action(action)
                .targetEmail(targetEmail)
                .details(details)
                .build();
        auditLogRepository.save(entry);
    }

    @Override
    public PageResponse<AuditLogResponse> getLogs(String actorEmail, AuditAction action, int page, int size) {
        int safeSize = (size <= 0 || size > 100) ? 30 : size;
        int safePage = Math.max(page, 0);

        Page<AuditLog> result = auditLogRepository.search(actorEmail, action, PageRequest.of(safePage, safeSize));

        return PageResponse.from(result.map(this::toResponse));
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorEmail(log.getActorEmail())
                .actorName(log.getActorName())
                .action(log.getAction())
                .targetEmail(log.getTargetEmail())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
