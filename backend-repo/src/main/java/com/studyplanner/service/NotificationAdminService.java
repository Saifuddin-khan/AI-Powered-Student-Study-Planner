package com.studyplanner.service;

import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.entity.Notification;

public interface NotificationAdminService {
    
    PageResponse<Notification> getAllNotifications(int page, int size);
    Notification createNotification(String title, String message, String type, Boolean isGlobal);
    void sendNotification(Long notificationId, Long[] userIds);
    void sendNotificationToAllUsers(Long notificationId);
    PageResponse<Notification> getNotificationsByType(String type, int page, int size);
    long getDeliveredCount(Long notificationId);
    long getReadCount(Long notificationId);
    void deleteNotification(Long notificationId);
}
