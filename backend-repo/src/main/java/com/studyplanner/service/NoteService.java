package com.studyplanner.service;

import com.studyplanner.dto.request.NoteRequest;
import com.studyplanner.dto.response.NoteResponse;
import com.studyplanner.dto.response.PageResponse;

public interface NoteService {

    NoteResponse createNote(String email, NoteRequest request);

    PageResponse<NoteResponse> getAllNotes(String email, Long subjectId, String keyword, int page, int size);

    NoteResponse getNoteById(String email, Long id);

    NoteResponse updateNote(String email, Long id, NoteRequest request);

    void deleteNote(String email, Long id);
}
