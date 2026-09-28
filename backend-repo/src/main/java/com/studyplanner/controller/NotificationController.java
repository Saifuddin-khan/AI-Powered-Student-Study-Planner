package com.studyplanner.controller;

import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.NotificationResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {

        PageResponse<NotificationResponse> result =
                notificationService.getNotifications(userDetails.getUsername(), unreadOnly, page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", result));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        NotificationResponse response = notificationService.markAsRead(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", response));
    }

    @PatchMapping("/{id}/unread")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsUnread(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        NotificationResponse response = notificationService.markAsUnread(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as unread", response));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        notificationService.deleteNotification(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted"));
    }
}
