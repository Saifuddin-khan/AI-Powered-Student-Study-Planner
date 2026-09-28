package com.studyplanner.dto.request;

import com.studyplanner.enums.Priority;
import com.studyplanner.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private Long subjectId;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private TaskStatus status = TaskStatus.PENDING;

    private LocalDate dueDate;

    private Integer estimatedMinutes;
}
