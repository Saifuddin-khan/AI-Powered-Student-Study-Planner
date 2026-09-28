package com.studyplanner.dto.request;

import com.studyplanner.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UpdateUserRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;
}
