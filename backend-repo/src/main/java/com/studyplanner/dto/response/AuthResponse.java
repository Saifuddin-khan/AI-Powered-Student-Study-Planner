package com.studyplanner.dto.response;

import com.studyplanner.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private Long userId;
    private String name;
    private String email;
    private Role role;
    private String accessToken;
    private String refreshToken;
}
