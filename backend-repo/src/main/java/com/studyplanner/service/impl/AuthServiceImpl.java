package com.studyplanner.service.impl;

import com.studyplanner.dto.request.ChangePasswordRequest;
import com.studyplanner.dto.request.LoginRequest;
import com.studyplanner.dto.request.RefreshTokenRequest;
import com.studyplanner.dto.request.RegisterRequest;
import com.studyplanner.dto.response.AuthResponse;
import com.studyplanner.dto.response.TokenResponse;
import com.studyplanner.entity.PasswordResetOtp;
import com.studyplanner.entity.RefreshToken;
import com.studyplanner.entity.User;
import com.studyplanner.enums.AuditAction;
import com.studyplanner.enums.Role;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.PasswordResetOtpRepository;
import com.studyplanner.repository.RefreshTokenRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.security.JwtUtil;
import com.studyplanner.service.AuditLogService;
import com.studyplanner.service.AuthService;
import com.studyplanner.service.EmailService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final long refreshTokenExpiryDays;

    public AuthServiceImpl(UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordResetOtpRepository otpRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           AuthenticationManager authenticationManager,
                           EmailService emailService,
                           AuditLogService auditLogService,
                           @Value("${app.jwt.refresh-token-expiry-days}") long refreshTokenExpiryDays) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
        this.refreshTokenExpiryDays = refreshTokenExpiryDays;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);
        auditLogService.log(user.getEmail(), user.getName(), AuditAction.REGISTER, null, null);

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshTokenValue = createAndSaveRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshTokenValue);
    }

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    @Override
    @Transactional(noRollbackFor = BadRequestException.class)
    public AuthResponse login(LoginRequest request) {
        // Load user first so we can track brute-force attempts per account
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null && Boolean.TRUE.equals(user.getAccountLocked())) {
            LocalDateTime lockTime = user.getLockTime();
            if (lockTime != null && lockTime.plusMinutes(LOCK_DURATION_MINUTES).isAfter(LocalDateTime.now())) {
                long minutesLeft = ChronoUnit.MINUTES.between(LocalDateTime.now(),
                        lockTime.plusMinutes(LOCK_DURATION_MINUTES)) + 1;
                throw new BadRequestException(
                        "Account locked due to too many failed login attempts. Try again in "
                        + minutesLeft + " minute(s).");
            }
            // Lock window expired — auto-unlock
            user.setAccountLocked(false);
            user.setFailedLoginAttempts(0);
            user.setLockTime(null);
            userRepository.save(user);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (AuthenticationException ex) {
            if (user != null) {
                int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
                user.setFailedLoginAttempts(attempts);
                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    user.setAccountLocked(true);
                    user.setLockTime(LocalDateTime.now());
                    userRepository.save(user);
                    throw new BadRequestException(
                            "Account locked due to too many failed login attempts. Try again in "
                            + LOCK_DURATION_MINUTES + " minutes.");
                }
                userRepository.save(user);
                int remaining = MAX_FAILED_ATTEMPTS - attempts;
                throw new BadRequestException(
                        "Invalid email or password. " + remaining + " attempt(s) remaining before account lock.");
            }
            throw new BadRequestException("Invalid email or password");
        }

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if (!user.isActive()) {
            throw new BadRequestException("Your account has been deactivated. Please contact support.");
        }

        if (Boolean.TRUE.equals(user.getIsDisabled())) {
            throw new BadRequestException("Your account has been disabled by an administrator. Please contact support.");
        }

        // Successful login — reset brute-force counters
        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        user.setLockTime(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        refreshTokenRepository.revokeAllUserTokens(user);
        auditLogService.log(user.getEmail(), user.getName(), AuditAction.LOGIN, null, null);

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshTokenValue = createAndSaveRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshTokenValue);
    }

    @Override
    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (storedToken.isRevoked()) {
            throw new BadRequestException("Refresh token has been revoked");
        }

        if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token has expired. Please login again.");
        }

        User user = storedToken.getUser();

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = createAndSaveRefreshToken(user);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken())
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    User user = token.getUser();
                    auditLogService.log(user.getEmail(), user.getName(), AuditAction.LOGOUT, null, null);
                });
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenRepository.revokeAllUserTokens(user);
        auditLogService.log(user.getEmail(), user.getName(), AuditAction.PASSWORD_CHANGE, null, null);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email"));

        otpRepository.invalidateAllUserOtps(user);

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));

        PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                .user(user)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .build();
        otpRepository.save(resetOtp);

        emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);
    }

    @Override
    @Transactional
    public void resetPassword(String otp, String newPassword) {
        PasswordResetOtp resetOtp = otpRepository
                .findTopByOtpAndIsUsedFalseOrderByCreatedAtDesc(otp)
                .orElseThrow(() -> new BadRequestException("Invalid or already used OTP"));

        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        User user = resetOtp.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);

        refreshTokenRepository.revokeAllUserTokens(user);
        auditLogService.log(user.getEmail(), user.getName(), AuditAction.PASSWORD_RESET, null, null);
    }

    private String createAndSaveRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .expiryDate(LocalDateTime.now().plusDays(refreshTokenExpiryDays))
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void promoteToAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
    }
}
