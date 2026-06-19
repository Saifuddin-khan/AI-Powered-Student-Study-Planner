package com.studyplanner.service;

import java.time.LocalDate;
import java.util.Map;

public interface AdminAnalyticsService {
    
    Map<String, Object> getDashboardStats();
    Map<String, Object> getUserAnalytics();
    Map<String, Object> getTaskAnalytics();
    Map<String, Object> getSubjectAnalytics();
    Map<String, Object> getPomodoroAnalytics();
    Map<String, Object> getNotificationAnalytics();
    Map<String, Object> getActivityReport(LocalDate startDate, LocalDate endDate);
    byte[] exportReport(String reportType, String format);
}
