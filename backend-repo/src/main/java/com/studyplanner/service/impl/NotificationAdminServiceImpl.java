package com.studyplanner.service.impl;

import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.entity.Notification;
import com.studyplanner.entity.User;
import com.studyplanner.entity.UserNotification;
import com.studyplanner.enums.NotificationType;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.NotificationRepository;
import com.studyplanner.repository.UserNotificationRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.NotificationAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationAdminServiceImpl implements NotificationAdminService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;

    @Override
    public PageResponse<Notification> getAllNotifications(int page, int size) {
        if (page < 0 || size <= 0 || size > 100) {
            throw new BadRequestException("Invalid pagination parameters");
        }

        Page<Notification> notifications = notificationRepository.findAll(PageRequest.of(page, size));

        return PageResponse.<Notification>builder()
                .content(notifications.getContent())
                .pageNumber(notifications.getNumber())
                .pageSize(notifications.getSize())
                .totalElements(notifications.getTotalElements())
                .totalPages(notifications.getTotalPages())
                .last(notifications.isLast())
                .build();
    }

    @Override
    public Notification createNotification(String title, String message, String type, Boolean isGlobal) {
        if (title == null || title.isEmpty()) {
            throw new BadRequestException("Notification title is required");
        }
        if (message == null || message.isEmpty()) {
            throw new BadRequestException("Notification message is required");
        }

        NotificationType notificationType;
        try {
            notificationType = NotificationType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid notification type: " + type);
        }

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(notificationType)
                .isGlobal(isGlobal != null ? isGlobal : false)
                .userNotifications(new HashSet<>())
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", saved.getId());

        return saved;
    }

    @Override
    public void sendNotification(Long notificationId, Long[] userIds) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (userIds == null || userIds.length == 0) {
            throw new BadRequestException("At least one user ID is required");
        }

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

            UserNotification userNotification = UserNotification.builder()
                    .user(user)
                    .notification(notification)
                    .isRead(false)
                    .isDelivered(true)
                    .deliveredAt(LocalDateTime.now())
                    .build();

            userNotificationRepository.save(userNotification);
        }

        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);

        log.info("Notification {} sent to {} users", notificationId, userIds.length);
    }

    @Override
    public void sendNotificationToAllUsers(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        java.util.List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            if (!Boolean.TRUE.equals(user.getIsDisabled())) {
                UserNotification userNotification = UserNotification.builder()
                        .user(user)
                        .notification(notification)
                        .isRead(false)
                        .isDelivered(true)
                        .deliveredAt(LocalDateTime.now())
                        .build();

                userNotificationRepository.save(userNotification);
            }
        }

        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);

        log.info("Notification {} sent to all {} users", notificationId, allUsers.size());
    }

    @Override
    public PageResponse<Notification> getNotificationsByType(String type, int page, int size) {
        NotificationType notificationType;
        try {
            notificationType = NotificationType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid notification type: " + type);
        }

        Page<Notification> notifications = notificationRepository.findByType(notificationType, PageRequest.of(page, size));

        return PageResponse.<Notification>builder()
                .content(notifications.getContent())
                .pageNumber(notifications.getNumber())
                .pageSize(notifications.getSize())
                .totalElements(notifications.getTotalElements())
                .totalPages(notifications.getTotalPages())
                .last(notifications.isLast())
                .build();
    }

    @Override
    public long getDeliveredCount(Long notificationId) {
        if (notificationId == null) {
            throw new BadRequestException("Notification ID is required");
        }

        return userNotificationRepository.findAll().stream()
                .filter(un -> un.getNotification().getId().equals(notificationId) && un.getIsDelivered())
                .count();
    }

    @Override
    public long getReadCount(Long notificationId) {
        if (notificationId == null) {
            throw new BadRequestException("Notification ID is required");
        }

        return userNotificationRepository.findAll().stream()
                .filter(un -> un.getNotification().getId().equals(notificationId) && un.getIsRead())
                .count();
    }

    @Override
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notificationRepository.delete(notification);
        log.info("Notification {} deleted", notificationId);
    }
}
