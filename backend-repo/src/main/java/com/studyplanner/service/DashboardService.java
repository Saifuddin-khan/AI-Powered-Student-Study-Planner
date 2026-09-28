package com.studyplanner.service;

import com.studyplanner.dto.response.DashboardHeatmapPoint;
import com.studyplanner.dto.response.DashboardStatsResponse;

import java.util.List;

public interface DashboardService {

    DashboardStatsResponse getStats(String email);

    List<DashboardHeatmapPoint> getHeatmap(String email, int weeks);
}
