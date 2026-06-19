package com.studyplanner.dto.response;

import com.studyplanner.enums.Priority;
import com.studyplanner.enums.TaskSource;
import com.studyplanner.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private Long subjectId;
    private String subjectName;
    private String subjectColorHex;
    private Priority priority;
    private TaskStatus status;
    private LocalDate dueDate;
    private TaskSource source;
    private Integer estimatedMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long generatedStudyPlanId;
    private Long syllabusTopicId;
    private String syllabusTopicName;
}
