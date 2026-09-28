package com.studyplanner.controller;

import com.studyplanner.dto.request.NoteRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.NoteResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse data = noteService.createNote(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note created successfully", data));
    }

    @GetMapping
    ResponseEntity<ApiResponse<PageResponse<NoteResponse>>> getAllNotes(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<NoteResponse> data = noteService.getAllNotes(
                userDetails.getUsername(), subjectId, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Notes fetched successfully", data));
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<NoteResponse>> getNoteById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        NoteResponse data = noteService.getNoteById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Note fetched successfully", data));
    }

    @PutMapping("/{id}")
    ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse data = noteService.updateNote(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Note updated successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> deleteNote(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        noteService.deleteNote(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully"));
    }
}
