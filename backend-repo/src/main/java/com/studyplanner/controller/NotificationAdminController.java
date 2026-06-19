package com.studyplanner.controller;

import com.studyplanner.dto.request.NotificationCreateRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.entity.Notification;
import com.studyplanner.service.NotificationAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class NotificationAdminController {

    private final NotificationAdminService notificationAdminService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Notification>>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<Notification> notifications = notificationAdminService.getAllNotifications(page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> createNotification(
            @Valid @RequestBody NotificationCreateRequest request) {
        Notification notification = notificationAdminService.createNotification(
                request.getTitle(), request.getMessage(),
                request.getType(), request.getIsGlobal());
        return ResponseEntity.ok(ApiResponse.success("Notification created", notification));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<Void>> sendNotification(
            @PathVariable Long id,
            @RequestParam(required = false) Long[] userIds) {
        if (userIds != null && userIds.length > 0) {
            notificationAdminService.sendNotification(id, userIds);
        } else {
            notificationAdminService.sendNotificationToAllUsers(id);
        }
        return ResponseEntity.ok(ApiResponse.success("Notification sent successfully"));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<PageResponse<Notification>>> getNotificationsByType(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<Notification> notifications = notificationAdminService.getNotificationsByType(type, page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications by type retrieved", notifications));
    }

    @GetMapping("/{id}/delivery-status")
    public ResponseEntity<ApiResponse<Object>> getDeliveryStatus(@PathVariable Long id) {
        long delivered = notificationAdminService.getDeliveredCount(id);
        long read = notificationAdminService.getReadCount(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery status", new Object() {
            public final long deliveredCount = delivered;
            public final long readCount = read;
        }));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationAdminService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
    }
}
