package com.studyplanner.service;

import com.studyplanner.entity.RefreshToken;
import com.studyplanner.entity.User;
import com.studyplanner.enums.Role;
import com.studyplanner.repository.RefreshTokenRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.security.JwtUtil;
import com.studyplanner.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${app.jwt.refresh-token-expiry-days:7}")
    private int refreshTokenExpiryDays;

    @Transactional
    public String[] processOAuthLogin(String email, String name) {
        boolean[] isNewUser = {false};

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            isNewUser[0] = true;
            User newUser = User.builder()
                    .name(name)
                    .email(email)
                    .password(UUID.randomUUID().toString())
                    .role(Role.USER)
                    .isActive(true)
                    .isDisabled(false)
                    .build();
            return userRepository.save(newUser);
        });

        if (Boolean.TRUE.equals(user.getIsDisabled()) || !user.isActive()) {
            return null; // caller redirects to error page
        }

        refreshTokenRepository.revokeAllUserTokens(user);

        String accessToken  = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshValue = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshValue)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(refreshTokenExpiryDays))
                .build();
        refreshTokenRepository.save(refreshToken);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Send welcome email only on first-ever Google login (non-blocking)
        if (isNewUser[0]) {
            final String userName = user.getName();
            final String userEmail = user.getEmail();
            CompletableFuture.runAsync(() -> emailService.sendWelcomeEmail(userEmail, userName))
                    .exceptionally(ex -> { log.warn("Welcome email async failed: {}", ex.getMessage()); return null; });
        }

        return new String[]{
                accessToken, refreshValue,
                String.valueOf(user.getId()), user.getName(),
                user.getEmail(), user.getRole().name()
        };
    }
}
