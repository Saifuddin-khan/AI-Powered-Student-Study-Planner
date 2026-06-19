package com.studyplanner.service;

import com.studyplanner.dto.response.NotificationResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.enums.NotificationType;

public interface NotificationService {

    PageResponse<NotificationResponse> getNotifications(String email, Boolean unreadOnly, int page, int size);

    NotificationResponse markAsRead(String email, Long id);

    NotificationResponse markAsUnread(String email, Long id);

    void markAllAsRead(String email);

    void deleteNotification(String email, Long id);

    long getUnreadCount(String email);

    void createNotification(String email, String title, String message, NotificationType type);
}
