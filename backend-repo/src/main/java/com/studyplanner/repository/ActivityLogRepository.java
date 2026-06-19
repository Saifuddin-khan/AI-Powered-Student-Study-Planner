package com.studyplanner.repository;

import com.studyplanner.entity.ActivityLog;
import com.studyplanner.entity.User;
import com.studyplanner.enums.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findByUser(User user, Pageable pageable);
    Page<ActivityLog> findByAdmin(User admin, Pageable pageable);
    Page<ActivityLog> findByActivityType(ActivityType type, Pageable pageable);
    Page<ActivityLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByActivityTypeAndCreatedAtBetween(ActivityType type, LocalDateTime start, LocalDateTime end);

    void deleteByUser(User user);
}
