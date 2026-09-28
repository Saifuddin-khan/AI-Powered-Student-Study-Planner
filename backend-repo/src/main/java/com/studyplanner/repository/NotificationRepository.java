package com.studyplanner.repository;

import com.studyplanner.entity.Notification;
import com.studyplanner.entity.User;
import com.studyplanner.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByType(NotificationType type, Pageable pageable);
    Page<Notification> findByIsGlobalTrue(Pageable pageable);
    Page<Notification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    long countBySentAtNotNull();

    @Modifying
    @Query("UPDATE Notification n SET n.createdBy = null WHERE n.createdBy = :user")
    void clearCreatedBy(@Param("user") User user);
}
