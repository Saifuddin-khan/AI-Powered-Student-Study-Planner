package com.studyplanner.controller;

import com.studyplanner.dto.request.SubjectRequest;
import com.studyplanner.dto.response.ApiResponse;
import com.studyplanner.dto.response.SubjectResponse;
import com.studyplanner.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping
    ResponseEntity<ApiResponse<SubjectResponse>> createSubject(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse data = subjectService.createSubject(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created successfully", data));
    }

    @GetMapping
    ResponseEntity<ApiResponse<List<SubjectResponse>>> getAllSubjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SubjectResponse> data = subjectService.getAllSubjects(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Subjects fetched successfully", data));
    }

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<SubjectResponse>> getSubjectById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        SubjectResponse data = subjectService.getSubjectById(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Subject fetched successfully", data));
    }

    @PutMapping("/{id}")
    ResponseEntity<ApiResponse<SubjectResponse>> updateSubject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse data = subjectService.updateSubject(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", data));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> deleteSubject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        subjectService.deleteSubject(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully"));
    }
}
