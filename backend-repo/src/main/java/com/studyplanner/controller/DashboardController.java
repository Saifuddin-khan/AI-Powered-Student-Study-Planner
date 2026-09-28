package com.studyplanner.controller;

import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.DashboardHeatmapPoint;
import com.studyplanner.dto.response.DashboardStatsResponse;
import com.studyplanner.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardStatsResponse data = dashboardService.getStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched successfully", data));
    }

    @GetMapping("/heatmap")
    ResponseEntity<ApiResponse<List<DashboardHeatmapPoint>>> getHeatmap(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "13") int weeks) {
        List<DashboardHeatmapPoint> data = dashboardService.getHeatmap(userDetails.getUsername(), weeks);
        return ResponseEntity.ok(ApiResponse.success("Heatmap fetched successfully", data));
    }
}
