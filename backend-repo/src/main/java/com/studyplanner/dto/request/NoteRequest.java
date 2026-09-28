package com.studyplanner.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoteRequest {

    @NotBlank(message = "Note title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String content;

    private Long subjectId;
}
