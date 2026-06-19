package com.studyplanner.service;

import com.studyplanner.dto.request.SubjectRequest;
import com.studyplanner.dto.response.SubjectResponse;

import java.util.List;

public interface SubjectService {

    SubjectResponse createSubject(String email, SubjectRequest request);

    List<SubjectResponse> getAllSubjects(String email);

    SubjectResponse getSubjectById(String email, Long id);

    SubjectResponse updateSubject(String email, Long id, SubjectRequest request);

    void deleteSubject(String email, Long id);
}
