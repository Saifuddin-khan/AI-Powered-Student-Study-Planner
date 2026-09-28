package com.studyplanner.service;

import com.studyplanner.entity.Notification;
import com.studyplanner.entity.User;
import com.studyplanner.entity.UserNotification;
import com.studyplanner.enums.NotificationType;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.NotificationRepository;
import com.studyplanner.repository.UserNotificationRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.impl.NotificationAdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DisplayName("NotificationAdminService Unit Tests")
public class NotificationAdminServiceTest {

    private NotificationAdminServiceImpl notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserNotificationRepository userNotificationRepository;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        notificationService = new NotificationAdminServiceImpl(
            notificationRepository,
            userNotificationRepository,
            userRepository
        );
    }

    @Test
    @DisplayName("Should create notification successfully")
    void testCreateNotificationSuccess() {
        Notification notification = Notification.builder()
            .id(1L)
            .title("Test Notification")
            .message("Test message")
            .type(NotificationType.ANNOUNCEMENT)
            .isGlobal(true)
            .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(
            "Test Notification",
            "Test message",
            "ANNOUNCEMENT",
            true
        );

        assertNotNull(result);
        assertEquals("Test Notification", result.getTitle());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should throw exception for invalid notification type")
    void testCreateNotificationWithInvalidType() {
        assertThrows(BadRequestException.class, () ->
            notificationService.createNotification("Title", "Message", "INVALID_TYPE", false)
        );
    }

    @Test
    @DisplayName("Should send notification to specific users")
    void testSendNotificationSuccess() {
        Notification notification = Notification.builder()
            .id(1L)
            .title("Test")
            .message("Test message")
            .type(NotificationType.ANNOUNCEMENT)
            .build();

        User user = User.builder().id(1L).name("User").build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userNotificationRepository.save(any(UserNotification.class)))
            .thenReturn(UserNotification.builder().build());

        notificationService.sendNotification(1L, new Long[]{1L});

        verify(userNotificationRepository, times(1)).save(any(UserNotification.class));
    }

    @Test
    @DisplayName("Should get delivery count for notification")
    void testGetDeliveredCountSuccess() {
        when(userNotificationRepository.findAll()).thenReturn(java.util.List.of(
            UserNotification.builder()
                .notification(Notification.builder().id(1L).build())
                .isDelivered(true)
                .build()
        ));

        long count = notificationService.getDeliveredCount(1L);

        assertEquals(1, count);
    }

    @Test
    @DisplayName("Should throw exception when notification not found")
    void testSendNotificationNotFound() {
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
            notificationService.sendNotification(1L, new Long[]{1L})
        );
    }

    @Test
    @DisplayName("Should delete notification successfully")
    void testDeleteNotificationSuccess() {
        Notification notification = Notification.builder().id(1L).build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        notificationService.deleteNotification(1L);

        verify(notificationRepository, times(1)).delete(any(Notification.class));
    }
}
