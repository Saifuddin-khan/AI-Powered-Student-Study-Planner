package com.studyplanner.controller;

import com.studyplanner.dto.request.CreateUserRequest;
import com.studyplanner.dto.request.UpdateUserRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.UserResponse;
import com.studyplanner.enums.Role;
import com.studyplanner.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        PageResponse<UserResponse> users = adminService.getAllUsers(page, size, search);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse user = adminService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse user = adminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long id,
            @RequestParam Role newRole) {
        UserResponse user = adminService.changeUserRole(id, newRole);
        return ResponseEntity.ok(ApiResponse.success("User role changed successfully", user));
    }

    @PostMapping("/users/{id}/password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {
        adminService.resetUserPassword(id, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    @PutMapping("/users/{id}/disable")
    public ResponseEntity<ApiResponse<Void>> disableUser(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        adminService.disableUser(id, reason != null ? reason : "Disabled by admin");
        return ResponseEntity.ok(ApiResponse.success("User disabled successfully"));
    }

    @PutMapping("/users/{id}/enable")
    public ResponseEntity<ApiResponse<Void>> enableUser(@PathVariable Long id) {
        adminService.enableUser(id);
        return ResponseEntity.ok(ApiResponse.success("User enabled successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUserPermanently(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted permanently"));
    }

    // ==================== IMPERSONATION ====================

    @PostMapping("/users/{userId}/impersonate")
    public ResponseEntity<ApiResponse<String>> startImpersonation(
            @PathVariable Long userId,
            @RequestAttribute("userId") Long adminId) {
        String sessionToken = adminService.startImpersonation(adminId, userId);
        return ResponseEntity.ok(ApiResponse.success("Impersonation started", sessionToken));
    }

    @PostMapping("/impersonate/exit")
    public ResponseEntity<ApiResponse<Void>> exitImpersonation(@RequestParam String sessionToken) {
        adminService.endImpersonation(sessionToken);
        return ResponseEntity.ok(ApiResponse.success("Impersonation ended"));
    }

    // ==================== SETTINGS ====================

    @GetMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<String>> getSetting(@PathVariable String key) {
        String value = adminService.getSystemSetting(key);
        return ResponseEntity.ok(ApiResponse.success("Setting retrieved", value));
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<Void>> updateSetting(
            @PathVariable String key,
            @RequestParam String value) {
        adminService.updateSystemSetting(key, value);
        return ResponseEntity.ok(ApiResponse.success("Setting updated successfully"));
    }
}
