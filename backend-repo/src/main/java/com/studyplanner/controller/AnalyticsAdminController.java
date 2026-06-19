package com.studyplanner.controller;

import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsAdminController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = adminAnalyticsService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserAnalytics() {
        Map<String, Object> analytics = adminAnalyticsService.getUserAnalytics();
        return ResponseEntity.ok(ApiResponse.success("User analytics retrieved", analytics));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTaskAnalytics() {
        Map<String, Object> analytics = adminAnalyticsService.getTaskAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Task analytics retrieved", analytics));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubjectAnalytics() {
        Map<String, Object> analytics = adminAnalyticsService.getSubjectAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Subject analytics retrieved", analytics));
    }

    @GetMapping("/pomodoro")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPomodoroAnalytics() {
        Map<String, Object> analytics = adminAnalyticsService.getPomodoroAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Pomodoro analytics retrieved", analytics));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotificationAnalytics() {
        Map<String, Object> analytics = adminAnalyticsService.getNotificationAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Notification analytics retrieved", analytics));
    }

    @PostMapping("/report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateActivityReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        Map<String, Object> report = adminAnalyticsService.getActivityReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Activity report generated", report));
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam String reportType,
            @RequestParam(defaultValue = "csv") String format) {
        byte[] reportData = adminAnalyticsService.exportReport(reportType, format);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"report." + format + "\"")
                .body(reportData);
    }
}
