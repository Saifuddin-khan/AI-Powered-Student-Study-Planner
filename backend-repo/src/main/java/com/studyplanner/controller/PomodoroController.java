package com.studyplanner.controller;

import com.studyplanner.dto.request.PomodoroSessionRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.PomodoroSessionResponse;
import com.studyplanner.enums.SessionType;
import com.studyplanner.service.PomodoroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pomodoro")
public class PomodoroController {

    private final PomodoroService pomodoroService;

    public PomodoroController(PomodoroService pomodoroService) {
        this.pomodoroService = pomodoroService;
    }

    @PostMapping("/start")
    ResponseEntity<ApiResponse<PomodoroSessionResponse>> startSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PomodoroSessionRequest request) {
        PomodoroSessionResponse data = pomodoroService.startSession(
                userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pomodoro session started", data));
    }

    @PatchMapping("/{id}/complete")
    ResponseEntity<ApiResponse<PomodoroSessionResponse>> completeSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        PomodoroSessionResponse data = pomodoroService.completeSession(
                userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Session completed successfully", data));
    }

    @GetMapping("/history")
    ResponseEntity<ApiResponse<List<PomodoroSessionResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) SessionType sessionType,
            @RequestParam(required = false) Integer limit) {
        List<PomodoroSessionResponse> data = pomodoroService.getHistory(
                userDetails.getUsername(), sessionType, limit);
        return ResponseEntity.ok(ApiResponse.success("Pomodoro history fetched successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> deleteSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        pomodoroService.deleteSession(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Pomodoro session deleted successfully"));
    }
}
