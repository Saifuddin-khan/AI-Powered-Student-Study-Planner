package com.studyplanner.service;

import com.studyplanner.enums.SyllabusFileType;

public interface OcrService {

    String extractText(byte[] fileBytes, SyllabusFileType fileType) throws Exception;
}
