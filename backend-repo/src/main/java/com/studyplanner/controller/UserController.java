package com.studyplanner.controller;

import com.studyplanner.dto.request.UpdateProfileRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.ProfileResponse;
import com.studyplanner.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        ProfileResponse data = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", data));
    }

    @GetMapping("/profile")
    ResponseEntity<ApiResponse<ProfileResponse>> getProfileAlias(
            @AuthenticationPrincipal UserDetails userDetails) {
        ProfileResponse data = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", data));
    }

    @PutMapping("/me")
    ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse data = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", data));
    }

    @PutMapping("/profile")
    ResponseEntity<ApiResponse<ProfileResponse>> updateProfileAlias(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse data = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", data));
    }

    @PostMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<ApiResponse<ProfileResponse>> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam MultipartFile file) {
        ProfileResponse data = userService.uploadProfileImage(userDetails.getUsername(), file);
        return ResponseEntity.ok(ApiResponse.success("Profile image updated successfully", data));
    }

    @DeleteMapping("/me")
    ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteAccount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }
}
