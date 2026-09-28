package com.studyplanner.service.impl;

import com.studyplanner.enums.ActivityType;
import com.studyplanner.enums.TaskStatus;
import com.studyplanner.repository.*;
import com.studyplanner.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final UserRepository             userRepository;
    private final ActivityLogRepository      activityLogRepository;
    private final NotificationRepository     notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final AdminActionRepository      adminActionRepository;
    private final TaskRepository             taskRepository;
    private final SubjectRepository          subjectRepository;
    private final PomodoroSessionRepository  pomodoroSessionRepository;

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers       = userRepository.count();
        long activeUsers      = userRepository.countActiveAndNotDisabled();
        long disabledUsers    = userRepository.countByIsDisabledTrue();

        LocalDateTime startOfYesterday = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime endOfYesterday   = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);
        long newRegistrations = userRepository.countByCreatedAtBetween(startOfYesterday, endOfYesterday);

        stats.put("totalUsers",       totalUsers);
        stats.put("activeUsers",      activeUsers);
        stats.put("disabledUsers",    disabledUsers);
        stats.put("newRegistrations", newRegistrations);

        long notificationsSent = notificationRepository.countBySentAtNotNull();
        long notificationsRead = userNotificationRepository.countByIsReadTrue();

        stats.put("notificationsSent", notificationsSent);
        stats.put("notificationsRead", notificationsRead);

        log.info("Dashboard stats retrieved");
        return stats;
    }

    @Override
    public Map<String, Object> getUserAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        long totalUsers    = userRepository.count();
        long activeUsers   = userRepository.countActiveAndNotDisabled();
        long disabledUsers = userRepository.countByIsDisabledTrue();
        long inactiveUsers = userRepository.countByIsActiveFalse();

        double activePercentage   = totalUsers > 0 ? (activeUsers   * 100.0 / totalUsers) : 0;
        double disabledPercentage = totalUsers > 0 ? (disabledUsers * 100.0 / totalUsers) : 0;

        analytics.put("totalUsers",         totalUsers);
        analytics.put("activeUsers",        activeUsers);
        analytics.put("disabledUsers",      disabledUsers);
        analytics.put("inactiveUsers",      inactiveUsers);
        analytics.put("activePercentage",   Math.round(activePercentage   * 100.0) / 100.0);
        analytics.put("disabledPercentage", Math.round(disabledPercentage * 100.0) / 100.0);

        log.info("User analytics retrieved");
        return analytics;
    }

    @Override
    public Map<String, Object> getTaskAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        long totalTasks     = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long pendingTasks   = taskRepository.countByStatus(TaskStatus.PENDING);
        long inProgress     = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        double completionRate = totalTasks > 0
                ? Math.round(completedTasks * 100.0 / totalTasks * 100.0) / 100.0 : 0.0;

        analytics.put("totalTasks",      totalTasks);
        analytics.put("completedTasks",  completedTasks);
        analytics.put("pendingTasks",    pendingTasks);
        analytics.put("inProgressTasks", inProgress);
        analytics.put("completionRate",  completionRate);

        log.info("Task analytics retrieved");
        return analytics;
    }

    @Override
    public Map<String, Object> getSubjectAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        long totalSubjects = subjectRepository.count();
        long totalTasks    = taskRepository.count();
        double avgTasksPerSubject = totalSubjects > 0
                ? Math.round(totalTasks * 100.0 / totalSubjects) / 100.0 : 0.0;

        analytics.put("totalSubjects",        totalSubjects);
        analytics.put("activeSubjects",       totalSubjects);
        analytics.put("averageTasksPerSubject", avgTasksPerSubject);

        log.info("Subject analytics retrieved");
        return analytics;
    }

    @Override
    public Map<String, Object> getPomodoroAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        long totalSessions     = pomodoroSessionRepository.count();
        long completedSessions = pomodoroSessionRepository.countByIsCompletedTrue();
        long totalMinutes      = pomodoroSessionRepository.sumTotalDurationMinutes();
        double totalHours      = Math.round(totalMinutes / 60.0 * 100.0) / 100.0;
        long avgDuration       = completedSessions > 0 ? totalMinutes / completedSessions : 0;

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday   = LocalDate.now().atTime(LocalTime.MAX);
        long sessionsToday = pomodoroSessionRepository.countByStartedAtBetween(startOfToday, endOfToday);

        analytics.put("totalSessions",          totalSessions);
        analytics.put("completedSessions",       completedSessions);
        analytics.put("totalStudyHours",         totalHours);
        analytics.put("averageSessionDuration",  avgDuration);
        analytics.put("sessionsToday",           sessionsToday);

        log.info("Pomodoro analytics retrieved");
        return analytics;
    }

    @Override
    public Map<String, Object> getNotificationAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        long totalNotifications    = notificationRepository.count();
        long sentNotifications     = notificationRepository.countBySentAtNotNull();
        long deliveredNotifications = userNotificationRepository.countByIsDeliveredTrue();
        long readNotifications     = userNotificationRepository.countByIsReadTrue();

        double deliveryRate = sentNotifications > 0
                ? (deliveredNotifications * 100.0 / sentNotifications) : 0;
        double readRate = deliveredNotifications > 0
                ? (readNotifications * 100.0 / deliveredNotifications) : 0;

        analytics.put("totalNotifications",    totalNotifications);
        analytics.put("sentNotifications",     sentNotifications);
        analytics.put("deliveredNotifications", deliveredNotifications);
        analytics.put("readNotifications",     readNotifications);
        analytics.put("deliveryRate",          Math.round(deliveryRate * 100.0) / 100.0);
        analytics.put("readRate",              Math.round(readRate * 100.0) / 100.0);

        log.info("Notification analytics retrieved");
        return analytics;
    }

    @Override
    public Map<String, Object> getActivityReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime   = endDate.atTime(LocalTime.MAX);

        long totalActivities        = activityLogRepository.countByCreatedAtBetween(startDateTime, endDateTime);
        long loginActivities        = activityLogRepository
                .countByActivityTypeAndCreatedAtBetween(ActivityType.USER_LOGIN, startDateTime, endDateTime);
        long registrationActivities = activityLogRepository
                .countByActivityTypeAndCreatedAtBetween(ActivityType.USER_REGISTRATION, startDateTime, endDateTime);

        report.put("startDate",              startDate);
        report.put("endDate",                endDate);
        report.put("totalActivities",        totalActivities);
        report.put("loginActivities",        loginActivities);
        report.put("registrationActivities", registrationActivities);

        log.info("Activity report generated for date range: {} to {}", startDate, endDate);
        return report;
    }

    @Override
    public byte[] exportReport(String reportType, String format) {
        byte[] reportData = new byte[]{};
        if ("csv".equalsIgnoreCase(format)) {
            reportData = generateCSVReport(reportType);
        } else if ("pdf".equalsIgnoreCase(format)) {
            reportData = generatePDFReport(reportType);
        }
        log.info("Report exported in format: {}", format);
        return reportData;
    }

    private byte[] generateCSVReport(String reportType) {
        StringBuilder csv = new StringBuilder();
        csv.append("Report Type,").append(reportType).append("\n");
        csv.append("Generated At,").append(LocalDateTime.now()).append("\n\n");

        if ("users".equalsIgnoreCase(reportType)) {
            csv.append("ID,Name,Email,Role,Active,Disabled,Created At\n");
            userRepository.findAll().forEach(user ->
                csv.append(user.getId()).append(",")
                   .append(user.getName()).append(",")
                   .append(user.getEmail()).append(",")
                   .append(user.getRole()).append(",")
                   .append(user.isActive()).append(",")
                   .append(user.getIsDisabled()).append(",")
                   .append(user.getCreatedAt()).append("\n")
            );
        }
        return csv.toString().getBytes();
    }

    private byte[] generatePDFReport(String reportType) {
        return ("PDF Report - " + reportType).getBytes();
    }
}
