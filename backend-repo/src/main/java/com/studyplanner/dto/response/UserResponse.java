package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean isActive;
    private Boolean isDisabled;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime disabledAt;
}
