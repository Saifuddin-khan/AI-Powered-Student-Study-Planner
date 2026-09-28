package com.studyplanner.controller;

import com.studyplanner.dto.request.TimetableRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.TimetableResponse;
import com.studyplanner.service.TimetableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/v1/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @PostMapping
    ResponseEntity<ApiResponse<TimetableResponse>> createSlot(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TimetableRequest request) {
        TimetableResponse data = timetableService.createSlot(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Timetable slot created successfully", data));
    }

    @GetMapping
    ResponseEntity<ApiResponse<List<TimetableResponse>>> getWeeklySchedule(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TimetableResponse> data = timetableService.getWeeklySchedule(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Weekly schedule fetched successfully", data));
    }

    @GetMapping("/day/{day}")
    ResponseEntity<ApiResponse<List<TimetableResponse>>> getSlotsByDay(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable DayOfWeek day) {
        List<TimetableResponse> data = timetableService.getSlotsByDay(userDetails.getUsername(), day);
        return ResponseEntity.ok(ApiResponse.success("Slots fetched successfully", data));
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<TimetableResponse>> getSlotById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        TimetableResponse data = timetableService.getSlotById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Timetable slot fetched successfully", data));
    }

    @PutMapping("/{id}")
    ResponseEntity<ApiResponse<TimetableResponse>> updateSlot(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TimetableRequest request) {
        TimetableResponse data = timetableService.updateSlot(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Timetable slot updated successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> deleteSlot(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        timetableService.deleteSlot(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Timetable slot deleted successfully"));
    }
}
