package com.studyplanner.repository;

import com.studyplanner.entity.AuditLog;
import com.studyplanner.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query(
        value = """
            SELECT a FROM AuditLog a
            WHERE (:actorEmail IS NULL OR a.actorEmail = :actorEmail)
              AND (:action IS NULL OR a.action = :action)
            ORDER BY a.createdAt DESC
            """,
        countQuery = """
            SELECT COUNT(a) FROM AuditLog a
            WHERE (:actorEmail IS NULL OR a.actorEmail = :actorEmail)
              AND (:action IS NULL OR a.action = :action)
            """
    )
    Page<AuditLog> search(@Param("actorEmail") String actorEmail,
                           @Param("action") AuditAction action,
                           Pageable pageable);
}
