package com.studyplanner.service;

import com.studyplanner.enums.SyllabusFileType;

public interface SyllabusProcessingService {

    void processAsync(Long syllabusFileId, byte[] fileBytes, SyllabusFileType fileType);
}
