package com.studyplanner.service.impl;

import com.studyplanner.dto.request.UpdateProfileRequest;
import com.studyplanner.dto.response.ProfileResponse;
import com.studyplanner.entity.User;
import com.studyplanner.enums.AuditAction;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.AuditLogService;
import com.studyplanner.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png");
    private static final Set<String> ALLOWED_EXTENSIONS    = Set.of("jpg", "jpeg", "png");
    private static final long        MAX_FILE_SIZE          = 5L * 1024 * 1024;

    private final UserRepository  userRepository;
    private final AuditLogService auditLogService;

    public UserServiceImpl(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository  = userRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public ProfileResponse getProfile(String email) {
        return toProfileResponse(findByEmail(email));
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);
        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName());
        if (request.getBio()   != null) user.setBio(request.getBio());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse uploadProfileImage(String email, MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            validateImageBytes(file, bytes);
            User user = findByEmail(email);
            String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
            String base64      = Base64.getEncoder().encodeToString(bytes);
            user.setProfileImage("data:" + contentType + ";base64," + base64);
            userRepository.save(user);
            return toProfileResponse(user);
        } catch (BadRequestException e) {
            throw e;
        } catch (IOException e) {
            throw new BadRequestException("Unable to read uploaded file");
        }
    }

    @Override
    @Transactional
    public void deleteAccount(String email) {
        User user = findByEmail(email);
        auditLogService.log(user.getEmail(), user.getName(), AuditAction.ACCOUNT_DELETED, null, "Self-deleted");
        userRepository.delete(user);
    }

    // ── Validation ───────────────────────────────────────────────────

    private void validateImageBytes(MultipartFile file, byte[] bytes) {
        if (file == null || file.isEmpty() || bytes.length == 0) {
            throw new BadRequestException("File is empty");
        }
        if (bytes.length > MAX_FILE_SIZE) {
            throw new BadRequestException("File size must not exceed 5 MB");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_CONTENT_TYPES.contains(ct.toLowerCase())) {
            throw new BadRequestException("Only JPEG and PNG images are accepted");
        }
        String filename = file.getOriginalFilename();
        if (filename != null && !filename.isBlank()) {
            int dot = filename.lastIndexOf('.');
            String ext = dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
            if (!ALLOWED_EXTENSIONS.contains(ext)) {
                throw new BadRequestException("Invalid file extension. Only .jpg, .jpeg, .png are allowed");
            }
        }
        // Magic-byte validation using the already-read bytes — no extra I/O
        boolean isJpeg = bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF;
        boolean isPng = bytes.length >= 4
                && (bytes[0] & 0xFF) == 0x89
                && (bytes[1] & 0xFF) == 0x50
                && (bytes[2] & 0xFF) == 0x4E
                && (bytes[3] & 0xFF) == 0x47;
        if (!isJpeg && !isPng) {
            throw new BadRequestException("File content does not match a valid JPEG or PNG image");
        }
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse toProfileResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .profileImage(user.getProfileImage())
                .build();
    }
}
