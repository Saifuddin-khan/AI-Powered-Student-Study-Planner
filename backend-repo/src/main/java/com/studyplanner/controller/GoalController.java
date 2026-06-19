package com.studyplanner.controller;

import com.studyplanner.dto.request.GoalProgressUpdateRequest;
import com.studyplanner.dto.request.GoalRequest;
import com.studyplanner.dto.request.GoalStatusUpdateRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.GoalResponse;
import com.studyplanner.enums.GoalStatus;
import com.studyplanner.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody GoalRequest request) {
        GoalResponse data = goalService.createGoal(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created successfully", data));
    }

    @GetMapping
    ResponseEntity<ApiResponse<List<GoalResponse>>> getAllGoals(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) GoalStatus status) {
        List<GoalResponse> data = goalService.getAllGoals(userDetails.getUsername(), status);
        return ResponseEntity.ok(ApiResponse.success("Goals fetched successfully", data));
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<GoalResponse>> getGoalById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        GoalResponse data = goalService.getGoalById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal fetched successfully", data));
    }

    @PutMapping("/{id}")
    ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request) {
        GoalResponse data = goalService.updateGoal(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", data));
    }

    @PatchMapping("/{id}/progress")
    ResponseEntity<ApiResponse<GoalResponse>> updateProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody GoalProgressUpdateRequest request) {
        GoalResponse data = goalService.updateProgress(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal progress updated successfully", data));
    }

    @PatchMapping("/{id}/status")
    ResponseEntity<ApiResponse<GoalResponse>> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody GoalStatusUpdateRequest request) {
        GoalResponse data = goalService.updateStatus(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal status updated successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> deleteGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        goalService.deleteGoal(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully"));
    }
}
