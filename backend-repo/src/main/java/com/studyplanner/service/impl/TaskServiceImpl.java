package com.studyplanner.service.impl;

import com.studyplanner.dto.request.TaskRequest;
import com.studyplanner.dto.request.TaskStatusUpdateRequest;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.TaskResponse;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.Task;
import com.studyplanner.entity.User;
import com.studyplanner.enums.Priority;
import com.studyplanner.enums.TaskStatus;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.SubjectRepository;
import com.studyplanner.repository.TaskRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.StreakService;
import com.studyplanner.service.TaskService;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StreakService streakService;

    public TaskServiceImpl(TaskRepository taskRepository,
                           UserRepository userRepository,
                           SubjectRepository subjectRepository,
                           StreakService streakService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.streakService = streakService;
    }

    @Override
    @Transactional
    public TaskResponse createTask(String email, TaskRequest request) {
        User user = getUser(email);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        Task task = Task.builder()
                .user(user)
                .subject(subject)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING)
                .dueDate(request.getDueDate())
                .estimatedMinutes(request.getEstimatedMinutes())
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Override
    @Transactional
    public PageResponse<TaskResponse> getAllTasks(String email, List<TaskStatus> statuses, Priority priority,
                                         Long subjectId, LocalDate dueDate, int page, int size) {
        User user = getUser(email);
        List<TaskStatus> normalizedStatuses = (statuses == null || statuses.isEmpty()) ? null : statuses;
        int safeSize = (size <= 0 || size > 100) ? 50 : size;
        int safePage = Math.max(page, 0);

        Page<Task> result = taskRepository.findByUserWithFilters(
                user, normalizedStatuses, priority, subjectId, dueDate, PageRequest.of(safePage, safeSize));

        return PageResponse.from(result.map(this::toResponse));
    }

    @Override
    @Transactional
    public TaskResponse getTaskById(String email, Long id) {
        User user = getUser(email);
        return toResponse(getTaskForUser(id, user));
    }

    @Override
    @Transactional
    public TaskResponse updateTask(String email, Long id, TaskRequest request) {
        User user = getUser(email);
        Task task = getTaskForUser(id, user);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setSubject(subject);
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus() != null ? request.getStatus() : task.getStatus());
        task.setDueDate(request.getDueDate());
        task.setEstimatedMinutes(request.getEstimatedMinutes());

        return toResponse(taskRepository.save(task));
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(String email, Long id, TaskStatusUpdateRequest request) {
        User user = getUser(email);
        Task task = getTaskForUser(id, user);
        task.setStatus(request.getStatus());
        TaskResponse response = toResponse(taskRepository.save(task));

        if (request.getStatus() == TaskStatus.COMPLETED) {
            streakService.updateStreak(email);
        }
        return response;
    }

    @Override
    @Transactional
    public void deleteTask(String email, Long id) {
        User user = getUser(email);
        Task task = getTaskForUser(id, user);
        taskRepository.delete(task);
    }

    @Override
    @Transactional
    public void deleteAllTasks(String email) {
        User user = getUser(email);
        taskRepository.deleteByUser(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Task getTaskForUser(Long id, User user) {
        return taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private Subject resolveSubject(Long subjectId, User user) {
        if (subjectId == null) return null;
        return subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private TaskResponse toResponse(Task task) {
        Long syllabusTopicId = null;
        String syllabusTopicName = null;

        if (task.getSyllabusTopic() != null) {
            try {
                Hibernate.initialize(task.getSyllabusTopic());
                syllabusTopicId = task.getSyllabusTopic().getId();
                syllabusTopicName = task.getSyllabusTopic().getTopicName();
            } catch (Exception e) {
                // Silently handle lazy loading errors
            }
        }

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .subjectId(task.getSubject() != null ? task.getSubject().getId() : null)
                .subjectName(task.getSubject() != null ? task.getSubject().getName() : null)
                .subjectColorHex(task.getSubject() != null ? task.getSubject().getColorHex() : null)
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .source(task.getSource())
                .estimatedMinutes(task.getEstimatedMinutes())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .syllabusTopicId(syllabusTopicId)
                .syllabusTopicName(syllabusTopicName)
                .build();
    }
}
