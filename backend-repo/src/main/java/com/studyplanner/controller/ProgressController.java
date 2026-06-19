package com.studyplanner.controller;

import com.studyplanner.dto.request.ProgressLogRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.ProgressLogResponse;
import com.studyplanner.dto.response.SubjectDurationResponse;
import com.studyplanner.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping
    ResponseEntity<ApiResponse<ProgressLogResponse>> logSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProgressLogRequest request) {
        ProgressLogResponse data = progressService.logSession(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session logged successfully", data));
    }

    @GetMapping
    ResponseEntity<ApiResponse<List<ProgressLogResponse>>> getLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<ProgressLogResponse> data = progressService.getLogs(
                userDetails.getUsername(), subjectId, from, to);
        return ResponseEntity.ok(ApiResponse.success("Progress logs fetched successfully", data));
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<ProgressLogResponse>> getLogById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        ProgressLogResponse data = progressService.getLogById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Progress log fetched successfully", data));
    }

    @GetMapping("/summary")
    ResponseEntity<ApiResponse<List<SubjectDurationResponse>>> getSubjectWiseSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SubjectDurationResponse> data = progressService.getSubjectWiseSummary(
                userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Subject summary fetched successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> deleteLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        progressService.deleteLog(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Progress log deleted successfully"));
    }
}
