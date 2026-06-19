package com.studyplanner.repository;

import com.studyplanner.entity.AuditTrail;
import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {
    Page<AuditTrail> findByUser(User user, Pageable pageable);
    Page<AuditTrail> findByAdmin(User admin, Pageable pageable);
    Page<AuditTrail> findByEntityType(String entityType, Pageable pageable);
    Page<AuditTrail> findByAction(String action, Pageable pageable);
    Page<AuditTrail> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
