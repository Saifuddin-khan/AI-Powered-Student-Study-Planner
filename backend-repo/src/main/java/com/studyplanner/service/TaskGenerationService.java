package com.studyplanner.service;

public interface TaskGenerationService {
    void generateTasksFromSyllabusTopicsAsync(String email, Long syllabusFileId);
}
