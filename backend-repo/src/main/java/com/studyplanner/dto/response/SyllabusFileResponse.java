package com.studyplanner.dto.response;

import com.studyplanner.enums.SyllabusFileType;
import com.studyplanner.enums.SyllabusStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SyllabusFileResponse {

    private Long id;
    private String fileName;
    private SyllabusFileType fileType;
    private SyllabusStatus status;
    private String errorMessage;
    private Long subjectId;
    private String subjectName;
    private List<SyllabusTopicResponse> topics;
    private LocalDateTime createdAt;
}
