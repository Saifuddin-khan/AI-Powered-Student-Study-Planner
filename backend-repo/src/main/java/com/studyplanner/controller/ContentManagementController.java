package com.studyplanner.controller;

import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.entity.*;
import com.studyplanner.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/content")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Transactional(readOnly = true)
public class ContentManagementController {

    private final SubjectRepository subjectRepository;
    private final TaskRepository    taskRepository;
    private final NoteRepository    noteRepository;
    private final GoalRepository    goalRepository;

    // ── SUBJECTS ─────────────────────────────────────────────────

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<Object>> getAllSubjects(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Subject> subjects = subjectRepository.findAll(PageRequest.of(page, size));
        var data = subjects.map(s -> Map.of(
                "id",          s.getId(),
                "name",        s.getName(),
                "colorHex",    s.getColorHex(),
                "description", s.getDescription() != null ? s.getDescription() : "",
                "userEmail",   s.getUser() != null ? s.getUser().getEmail() : "",
                "createdAt",   s.getCreatedAt() != null ? s.getCreatedAt().toString() : ""
        ));
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", data));
    }

    @GetMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<Object>> getSubjectById(@PathVariable Long id) {
        var subject = subjectRepository.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved", subject));
    }

    @DeleteMapping("/subjects/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully"));
    }

    // ── TASKS ────────────────────────────────────────────────────

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<Object>> getAllTasks(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Task> tasks = taskRepository.findAll(PageRequest.of(page, size));
        var data = tasks.map(t -> Map.of(
                "id",          t.getId(),
                "title",       t.getTitle(),
                "status",      t.getStatus() != null ? t.getStatus().name() : "",
                "priority",    t.getPriority() != null ? t.getPriority().name() : "",
                "userEmail",   t.getUser() != null ? t.getUser().getEmail() : "",
                "createdAt",   t.getCreatedAt() != null ? t.getCreatedAt().toString() : ""
        ));
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved", data));
    }

    @GetMapping("/tasks/search")
    public ResponseEntity<ApiResponse<Object>> searchTasks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        var tasks = taskRepository.findByTitleContainingIgnoreCase(query, PageRequest.of(page, size));
        var data = tasks.map(t -> Map.of(
                "id",    t.getId(),
                "title", t.getTitle(),
                "status", t.getStatus() != null ? t.getStatus().name() : ""
        ));
        return ResponseEntity.ok(ApiResponse.success("Tasks search results", data));
    }

    @DeleteMapping("/tasks/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }

    // ── NOTES ────────────────────────────────────────────────────

    @GetMapping("/notes")
    public ResponseEntity<ApiResponse<Object>> getAllNotes(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Note> notes = noteRepository.findAll(PageRequest.of(page, size));
        var data = notes.map(n -> Map.of(
                "id",        n.getId(),
                "title",     n.getTitle() != null ? n.getTitle() : "",
                "userEmail", n.getUser() != null ? n.getUser().getEmail() : "",
                "createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : ""
        ));
        return ResponseEntity.ok(ApiResponse.success("Notes retrieved", data));
    }

    @GetMapping("/notes/search")
    public ResponseEntity<ApiResponse<Object>> searchNotes(
            @RequestParam String query,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        var notes = noteRepository.findByQueryContainingIgnoreCase(query, PageRequest.of(page, size));
        var data = notes.map(n -> Map.of(
                "id",    n.getId(),
                "title", n.getTitle() != null ? n.getTitle() : ""
        ));
        return ResponseEntity.ok(ApiResponse.success("Notes search results", data));
    }

    @DeleteMapping("/notes/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long id) {
        noteRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully"));
    }

    // ── GOALS ────────────────────────────────────────────────────

    @GetMapping("/goals")
    public ResponseEntity<ApiResponse<Object>> getAllGoals(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Goal> goals = goalRepository.findAll(PageRequest.of(page, size));
        var data = goals.map(g -> Map.of(
                "id",        g.getId(),
                "title",     g.getTitle() != null ? g.getTitle() : "",
                "status",    g.getStatus() != null ? g.getStatus().name() : "",
                "userEmail", g.getUser() != null ? g.getUser().getEmail() : "",
                "createdAt", g.getCreatedAt() != null ? g.getCreatedAt().toString() : ""
        ));
        return ResponseEntity.ok(ApiResponse.success("Goals retrieved", data));
    }

    @DeleteMapping("/goals/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) {
        goalRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully"));
    }

    // ── STATISTICS ───────────────────────────────────────────────

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Object>> getContentStatistics() {
        return ResponseEntity.ok(ApiResponse.success("Content statistics", Map.of(
                "subjects", subjectRepository.count(),
                "tasks",    taskRepository.count(),
                "notes",    noteRepository.count(),
                "goals",    goalRepository.count()
        )));
    }
}
