package com.studyplanner.repository;

import com.studyplanner.entity.AdminAction;
import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface AdminActionRepository extends JpaRepository<AdminAction, Long> {
    Page<AdminAction> findByAdmin(User admin, Pageable pageable);
    Page<AdminAction> findByActionType(String actionType, Pageable pageable);
    Page<AdminAction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
