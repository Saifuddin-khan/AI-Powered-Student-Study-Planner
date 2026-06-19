package com.studyplanner.service;

import com.studyplanner.dto.request.UpdateProfileRequest;
import com.studyplanner.dto.response.ProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    ProfileResponse getProfile(String email);

    ProfileResponse updateProfile(String email, UpdateProfileRequest request);

    ProfileResponse uploadProfileImage(String email, MultipartFile file);

    void deleteAccount(String email);
}
