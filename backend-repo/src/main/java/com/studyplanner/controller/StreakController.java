package com.studyplanner.controller;

import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.StudyStreakResponse;
import com.studyplanner.service.StreakService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/streak")
public class StreakController {

    private final StreakService streakService;

    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    @GetMapping
    ResponseEntity<ApiResponse<StudyStreakResponse>> getStreak(
            @AuthenticationPrincipal UserDetails userDetails) {
        StudyStreakResponse data = streakService.getStreak(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Streak fetched successfully", data));
    }
}
