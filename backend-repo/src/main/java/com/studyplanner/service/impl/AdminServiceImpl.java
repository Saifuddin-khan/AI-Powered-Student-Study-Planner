package com.studyplanner.service.impl;

import com.studyplanner.dto.request.CreateUserRequest;
import com.studyplanner.dto.request.UpdateUserRequest;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.UserResponse;
import com.studyplanner.entity.*;
import com.studyplanner.enums.Role;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.repository.*;
import com.studyplanner.repository.AiUsageLogRepository;
import com.studyplanner.repository.ReportLogRepository;
import com.studyplanner.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final AdminSessionRepository adminSessionRepository;
    private final AuditTrailRepository auditTrailRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final AdminActionRepository adminActionRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserNotificationRepository userNotificationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final AiUsageLogRepository aiUsageLogRepository;
    private final ReportLogRepository reportLogRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public PageResponse<UserResponse> getAllUsers(int page, int size, String search) {
        if (page < 0 || size <= 0 || size > 100) {
            throw new BadRequestException("Invalid pagination parameters");
        }

        Page<User> users = (search != null && !search.isBlank())
                ? userRepository.searchByNameOrEmail(search.trim(), PageRequest.of(page, size))
                : userRepository.findAll(PageRequest.of(page, size));

        return PageResponse.<UserResponse>builder()
                .content(users.getContent().stream()
                        .map(this::toUserResponse)
                        .collect(Collectors.toList()))
                .pageNumber(users.getNumber())
                .pageSize(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .last(users.isLast())
                .build();
    }

    @Override
    public UserResponse getUserById(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid user ID");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        log.info("Retrieved user details for user ID: {}", id);
        return toUserResponse(user);
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (request == null || request.getName() == null || request.getEmail() == null) {
            throw new BadRequestException("User name and email are required");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isActive(true)
                .isDisabled(false)
                .build();

        User saved = userRepository.save(user);
        logAdminAction(getCurrentAdminId(), "USER_CREATED", "Created user with email: " + saved.getEmail());

        log.info("New user created with email: {}", saved.getEmail());
        return toUserResponse(saved);
    }

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        String oldValue = user.getName() + " | " + user.getEmail();

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        User updated = userRepository.save(user);

        String newValue = updated.getName() + " | " + updated.getEmail();
        auditTrailRepository.save(AuditTrail.builder()
                .entityType("User")
                .entityId(id)
                .action("UPDATE")
                .oldValue(oldValue)
                .newValue(newValue)
                .admin(getCurrentAdmin())
                .build());

        log.info("User {} updated successfully", id);
        return toUserResponse(updated);
    }

    @Override
    public UserResponse changeUserRole(Long id, Role newRole) {
        if (newRole == null) {
            throw new BadRequestException("New role is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        Role oldRole = user.getRole();
        user.setRole(newRole);
        User updated = userRepository.save(user);

        auditTrailRepository.save(AuditTrail.builder()
                .entityType("User")
                .entityId(id)
                .action("ROLE_CHANGED")
                .oldValue(oldRole.toString())
                .newValue(newRole.toString())
                .admin(getCurrentAdmin())
                .build());

        log.info("User {} role changed from {} to {}", id, oldRole, newRole);
        return toUserResponse(updated);
    }

    @Override
    public void resetUserPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        logAdminAction(getCurrentAdminId(), "PASSWORD_RESET", "Password reset for user: " + user.getEmail());
        log.info("Password reset for user: {}", user.getEmail());
    }

    @Override
    public void disableUser(Long id, String reason) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot disable admin users");
        }

        user.setIsDisabled(true);
        user.setDisabledAt(LocalDateTime.now());
        user.setAdminNotes(reason != null ? reason : "Disabled by admin");
        userRepository.save(user);

        logAdminAction(getCurrentAdminId(), "USER_DISABLED", reason != null ? reason : "User disabled");
        log.info("User {} disabled with reason: {}", id, reason);
    }

    @Override
    public void enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setIsDisabled(false);
        user.setDisabledAt(null);
        userRepository.save(user);

        logAdminAction(getCurrentAdminId(), "USER_ENABLED", "User enabled: " + user.getEmail());
        log.info("User {} enabled", id);
    }

    @Override
    public void deleteUserPermanently(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot delete admin users");
        }

        // Nullify notification creator references (notifications belong to the platform, not the user)
        notificationRepository.clearCreatedBy(user);

        // Delete records without DB-level CASCADE on the user FK
        adminSessionRepository.deleteByImpersonatedUser(user);
        userNotificationRepository.deleteByUser(user);
        activityLogRepository.deleteByUser(user);
        aiUsageLogRepository.deleteByUser(user);
        reportLogRepository.deleteByGeneratedBy(user);

        // All other user data (subjects, tasks, goals, etc.) is handled by ON DELETE CASCADE on the DB FK

        logAdminAction(getCurrentAdminId(), "USER_DELETED", "Permanently deleted user: " + user.getEmail());
        userRepository.deleteById(id);
        log.info("User {} permanently deleted", id);
    }

    @Override
    public String startImpersonation(Long adminId, Long userId) {
        if (adminId == null || userId == null) {
            throw new BadRequestException("Admin ID and User ID are required");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only admins can start impersonation");
        }

        User impersonatedUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String sessionToken = UUID.randomUUID().toString();
        AdminSession session = AdminSession.builder()
                .admin(admin)
                .impersonatedUser(impersonatedUser)
                .sessionToken(sessionToken)
                .isActive(true)
                .build();

        adminSessionRepository.save(session);
        logAdminAction(adminId, "ADMIN_IMPERSONATE",
                "Started impersonation for user: " + impersonatedUser.getEmail());

        log.info("Admin {} started impersonation of user {}", adminId, userId);
        return sessionToken;
    }

    @Override
    public void endImpersonation(String sessionToken) {
        if (sessionToken == null || sessionToken.isEmpty()) {
            throw new BadRequestException("Session token is required");
        }

        AdminSession session = adminSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        session.setIsActive(false);
        session.setEndedAt(LocalDateTime.now());
        adminSessionRepository.save(session);

        logAdminAction(session.getAdmin().getId(), "ADMIN_IMPERSONATE_EXIT",
                "Ended impersonation for user: " + session.getImpersonatedUser().getEmail());

        log.info("Impersonation session {} ended", sessionToken);
    }

    @Override
    public String getSystemSetting(String key) {
        if (key == null || key.isEmpty()) {
            throw new BadRequestException("Setting key is required");
        }

        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(null);
    }

    @Override
    public void updateSystemSetting(String key, String value) {
        if (key == null || key.isEmpty()) {
            throw new BadRequestException("Setting key is required");
        }

        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElse(SystemSetting.builder()
                        .key(key)
                        .dataType("STRING")
                        .isEditable(true)
                        .build());

        setting.setValue(value);
        systemSettingRepository.save(setting);

        logAdminAction(getCurrentAdminId(), "SETTINGS_UPDATED", "Updated setting: " + key + " = " + value);
        log.info("System setting {} updated", key);
    }

    private User getCurrentAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private Long getCurrentAdminId() {
        User admin = getCurrentAdmin();
        return admin != null ? admin.getId() : null;
    }

    @Override
    public void logAdminAction(Long adminId, String actionType, String details) {
        User admin = adminId != null ? userRepository.findById(adminId).orElse(null) : null;

        AdminAction action = AdminAction.builder()
                .admin(admin)
                .actionType(actionType)
                .details(details)
                .status("SUCCESS")
                .build();

        adminActionRepository.save(action);
        log.debug("Admin action logged: {} - {}", actionType, details);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .isActive(user.isActive())
                .isDisabled(user.getIsDisabled())
                .adminNotes(user.getAdminNotes())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .disabledAt(user.getDisabledAt())
                .build();
    }
}
