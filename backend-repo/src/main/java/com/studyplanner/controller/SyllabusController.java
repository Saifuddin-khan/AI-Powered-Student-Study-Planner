package com.studyplanner.controller;

import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.SyllabusFileResponse;
import com.studyplanner.service.SyllabusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/syllabus")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<ApiResponse<SyllabusFileResponse>> upload(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long subjectId,
            @RequestParam MultipartFile file) {
        SyllabusFileResponse data = syllabusService.upload(userDetails.getUsername(), subjectId, file);
        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Syllabus uploaded — AI analysis in progress", data));
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<SyllabusFileResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        SyllabusFileResponse data = syllabusService.getById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Syllabus file fetched successfully", data));
    }

    @GetMapping("/subject/{subjectId}")
    ResponseEntity<ApiResponse<PageResponse<SyllabusFileResponse>>> getBySubject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long subjectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<SyllabusFileResponse> data = syllabusService.getBySubject(
                userDetails.getUsername(), subjectId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Syllabus files fetched successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        syllabusService.delete(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Syllabus file deleted successfully"));
    }
}
