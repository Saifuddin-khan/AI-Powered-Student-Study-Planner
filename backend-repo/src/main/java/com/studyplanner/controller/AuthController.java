package com.studyplanner.controller;

import com.studyplanner.dto.request.ChangePasswordRequest;
import com.studyplanner.dto.request.ForgotPasswordRequest;
import com.studyplanner.dto.request.LoginRequest;
import com.studyplanner.dto.request.RefreshTokenRequest;
import com.studyplanner.dto.request.RegisterRequest;
import com.studyplanner.dto.request.ResetPasswordRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.AuthResponse;
import com.studyplanner.dto.response.TokenResponse;
import com.studyplanner.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", data));
    }

    @PostMapping("/login")
    ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", data));
    }

    @PostMapping("/refresh-token")
    ResponseEntity<ApiResponse<TokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse data = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", data));
    }

    @PostMapping("/logout")
    ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email address"));
    }

    @PostMapping("/reset-password")
    ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    @PostMapping("/change-password")
    ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @PostMapping("/setup-admin")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<ApiResponse<Void>> setupAdmin(@RequestParam String email) {
        authService.promoteToAdmin(email);
        return ResponseEntity.ok(ApiResponse.success("User promoted to admin"));
    }
}
