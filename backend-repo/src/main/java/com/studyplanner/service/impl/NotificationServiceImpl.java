package com.studyplanner.service.impl;

import com.studyplanner.dto.response.NotificationResponse;
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
import com.studyplanner.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final UserRepository             userRepository;
    private final NotificationRepository     notificationRepository;
    private final UserNotificationRepository userNotificationRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private NotificationResponse toResponse(UserNotification un) {
        Notification n = un.getNotification();
        return NotificationResponse.builder()
                .id(un.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(Boolean.TRUE.equals(un.getIsRead()))
                .createdAt(un.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(String email, Boolean unreadOnly, int page, int size) {
        User user = getUser(email);
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<UserNotification> pageResult = Boolean.TRUE.equals(unreadOnly)
                ? userNotificationRepository.findByUserAndIsReadFalse(user, pageable)
                : userNotificationRepository.findByUser(user, pageable);

        return PageResponse.<NotificationResponse>builder()
                .content(pageResult.map(this::toResponse).getContent())
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public NotificationResponse markAsRead(String email, Long id) {
        User user = getUser(email);
        UserNotification un = userNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!un.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not your notification");
        }

        un.setIsRead(true);
        un.setReadAt(LocalDateTime.now());
        userNotificationRepository.save(un);

        log.info("Notification {} marked as read by {}", id, email);
        return toResponse(un);
    }

    @Override
    public NotificationResponse markAsUnread(String email, Long id) {
        User user = getUser(email);
        UserNotification un = userNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!un.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not your notification");
        }

        un.setIsRead(false);
        un.setReadAt(null);
        userNotificationRepository.save(un);

        log.info("Notification {} marked as unread by {}", id, email);
        return toResponse(un);
    }

    @Override
    public void markAllAsRead(String email) {
        User user = getUser(email);
        PageRequest all = PageRequest.of(0, Integer.MAX_VALUE);
        userNotificationRepository.findByUserAndIsReadFalse(user, all)
                .forEach(un -> {
                    un.setIsRead(true);
                    un.setReadAt(LocalDateTime.now());
                    userNotificationRepository.save(un);
                });
        log.info("All notifications marked as read for {}", email);
    }

    @Override
    public void deleteNotification(String email, Long id) {
        User user = getUser(email);
        UserNotification un = userNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!un.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not your notification");
        }

        userNotificationRepository.delete(un);
        log.info("Notification {} deleted by {}", id, email);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = getUser(email);
        return userNotificationRepository.countByUserAndIsReadFalse(user);
    }

    @Override
    public void createNotification(String email, String title, String message, NotificationType type) {
        User user = getUser(email);

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .isGlobal(false)
                .sentAt(LocalDateTime.now())
                .userNotifications(new HashSet<>())
                .build();
        notificationRepository.save(notification);

        UserNotification un = UserNotification.builder()
                .user(user)
                .notification(notification)
                .isRead(false)
                .isDelivered(true)
                .deliveredAt(LocalDateTime.now())
                .build();
        userNotificationRepository.save(un);

        log.info("Notification created for {}", email);
    }
}
