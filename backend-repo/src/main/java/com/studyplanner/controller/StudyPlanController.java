package com.studyplanner.controller;

import com.studyplanner.dto.request.StudyPlanRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.StudyPlanResponse;
import com.studyplanner.service.StudyPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/study-plans")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    @PostMapping
    public ResponseEntity<ApiResponse<StudyPlanResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudyPlanRequest request) {
        StudyPlanResponse data = studyPlanService.create(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Study plan created", data));
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<List<StudyPlanResponse>>> getByDate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<StudyPlanResponse> data = studyPlanService.getByDate(userDetails.getUsername(), date);
        return ResponseEntity.ok(ApiResponse.success("Study plans fetched", data));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<StudyPlanResponse>>> getByRange(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<StudyPlanResponse> data = studyPlanService.getByRange(userDetails.getUsername(), from, to);
        return ResponseEntity.ok(ApiResponse.success("Study plans fetched", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyPlanResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        StudyPlanResponse data = studyPlanService.getById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Study plan fetched", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyPlanResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody StudyPlanRequest request) {
        StudyPlanResponse data = studyPlanService.update(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Study plan updated", data));
    }

    @PatchMapping("/{id}/toggle-complete")
    public ResponseEntity<ApiResponse<StudyPlanResponse>> toggleComplete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        StudyPlanResponse data = studyPlanService.toggleComplete(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Study plan updated", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        studyPlanService.delete(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Study plan deleted"));
    }
}
