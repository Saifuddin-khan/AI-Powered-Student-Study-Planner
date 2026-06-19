package com.studyplanner.service;

import com.studyplanner.dto.request.CreateUserRequest;
import com.studyplanner.dto.request.UpdateUserRequest;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.UserResponse;
import com.studyplanner.enums.Role;

public interface AdminService {
    
    // User Management
    PageResponse<UserResponse> getAllUsers(int page, int size, String search);
    UserResponse getUserById(Long id);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    UserResponse changeUserRole(Long id, Role newRole);
    void resetUserPassword(Long id, String newPassword);
    void disableUser(Long id, String reason);
    void enableUser(Long id);
    void deleteUserPermanently(Long id);
    
    // Impersonation
    String startImpersonation(Long adminId, Long userId);
    void endImpersonation(String sessionToken);
    
    // System
    String getSystemSetting(String key);
    void updateSystemSetting(String key, String value);
    
    // Audit & Logs
    void logAdminAction(Long adminId, String actionType, String details);
}
