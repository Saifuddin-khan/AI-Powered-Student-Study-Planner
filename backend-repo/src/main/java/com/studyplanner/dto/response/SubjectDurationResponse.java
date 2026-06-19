package com.studyplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SubjectDurationResponse {

    private Long subjectId;
    private String subjectName;
    private String subjectColorHex;
    private Integer totalMinutes;
}
