package com.studyplanner.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubjectRequest {

    @NotBlank(message = "Subject name is required")
    @Size(min = 1, max = 100, message = "Subject name must be between 1 and 100 characters")
    private String name;

    @NotBlank(message = "Color is required")
    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Color must be a valid hex code (e.g. #FF5733)")
    private String colorHex;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
}
