package com.studyplanner.controller;

import com.studyplanner.dto.request.TaskRequest;
import com.studyplanner.dto.request.TaskStatusUpdateRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.TaskResponse;
import com.studyplanner.enums.Priority;
import com.studyplanner.enums.TaskStatus;
import com.studyplanner.service.TaskService;
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
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse data = taskService.createTask(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", data));
    }

    @GetMapping
    ResponseEntity<ApiResponse<PageResponse<TaskResponse>>> getAllTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) List<TaskStatus> status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<TaskResponse> data = taskService.getAllTasks(
                userDetails.getUsername(), status, priority, subjectId, dueDate, page, size);
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched successfully", data));
    }

    @DeleteMapping("/bulk/delete-all")
    ResponseEntity<ApiResponse<Void>> deleteAllTasks(
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteAllTasks(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All tasks deleted successfully"));
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        TaskResponse data = taskService.getTaskById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Task fetched successfully", data));
    }

    @PutMapping("/{id}")
    ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse data = taskService.updateTask(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", data));
    }

    @PatchMapping("/{id}/status")
    ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        TaskResponse data = taskService.updateTaskStatus(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> deleteTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        taskService.deleteTask(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }
}
