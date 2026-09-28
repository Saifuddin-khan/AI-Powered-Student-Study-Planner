package com.studyplanner.service;

import com.studyplanner.dto.request.TaskRequest;
import com.studyplanner.dto.request.TaskStatusUpdateRequest;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.TaskResponse;
import com.studyplanner.enums.Priority;
import com.studyplanner.enums.TaskStatus;

import java.time.LocalDate;
import java.util.List;

public interface TaskService {

    TaskResponse createTask(String email, TaskRequest request);

    PageResponse<TaskResponse> getAllTasks(String email, List<TaskStatus> statuses, Priority priority,
                                  Long subjectId, LocalDate dueDate, int page, int size);

    TaskResponse getTaskById(String email, Long id);

    TaskResponse updateTask(String email, Long id, TaskRequest request);

    TaskResponse updateTaskStatus(String email, Long id, TaskStatusUpdateRequest request);

    void deleteTask(String email, Long id);

    void deleteAllTasks(String email);
}
