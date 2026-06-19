package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SubjectResponse {

    private Long id;
    private String name;
    private String colorHex;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
