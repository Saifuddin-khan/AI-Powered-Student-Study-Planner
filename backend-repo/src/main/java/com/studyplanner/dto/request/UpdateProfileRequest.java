package com.studyplanner.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Pattern(regexp = "^$|^[+]?[0-9]{7,15}$", message = "Invalid phone number format")
    private String phone;
}
