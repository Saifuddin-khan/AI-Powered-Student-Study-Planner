package com.studyplanner.service;

import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.dto.response.SyllabusFileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SyllabusService {

    SyllabusFileResponse upload(String email, Long subjectId, MultipartFile file);

    SyllabusFileResponse getById(String email, Long id);

    PageResponse<SyllabusFileResponse> getBySubject(String email, Long subjectId, int page, int size);

    void delete(String email, Long id);
}
