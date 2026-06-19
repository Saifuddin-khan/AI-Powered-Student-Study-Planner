package com.studyplanner.service;

import com.studyplanner.dto.request.ChangePasswordRequest;
import com.studyplanner.dto.request.LoginRequest;
import com.studyplanner.dto.request.RefreshTokenRequest;
import com.studyplanner.dto.request.RegisterRequest;
import com.studyplanner.dto.response.AuthResponse;
import com.studyplanner.dto.response.TokenResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    TokenResponse refreshToken(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    void forgotPassword(String email);

    void resetPassword(String otp, String newPassword);

    void promoteToAdmin(String email);
}
