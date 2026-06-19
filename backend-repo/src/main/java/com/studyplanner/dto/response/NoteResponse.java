package com.studyplanner.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoteResponse {

    private Long id;
    private String title;
    private String content;
    private Long subjectId;
    private String subjectName;
    private String subjectColorHex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
