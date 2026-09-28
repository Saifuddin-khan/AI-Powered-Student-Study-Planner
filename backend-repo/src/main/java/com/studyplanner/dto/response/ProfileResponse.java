package com.studyplanner.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.studyplanner.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String bio;
    private String phone;
    private Role role;
    @JsonProperty("isActive")
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private String profileImage;
}
