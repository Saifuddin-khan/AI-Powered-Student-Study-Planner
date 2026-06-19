package com.studyplanner.repository;

import com.studyplanner.entity.User;
import com.studyplanner.entity.UserNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    Page<UserNotification> findByUser(User user, Pageable pageable);
    Page<UserNotification> findByUserAndIsReadFalse(User user, Pageable pageable);
    long countByUserAndIsReadFalse(User user);
    long countByUserAndIsDeliveredFalse(User user);

    long countByIsReadTrue();
    long countByIsDeliveredTrue();

    void deleteByUser(User user);
}
