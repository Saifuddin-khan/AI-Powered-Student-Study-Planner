package com.studyplanner.service.impl;

import com.studyplanner.dto.request.NoteRequest;
import com.studyplanner.dto.response.NoteResponse;
import com.studyplanner.dto.response.PageResponse;
import com.studyplanner.entity.Note;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.NoteRepository;
import com.studyplanner.repository.SubjectRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.NoteService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public NoteServiceImpl(NoteRepository noteRepository,
                           UserRepository userRepository,
                           SubjectRepository subjectRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    @Transactional
    public NoteResponse createNote(String email, NoteRequest request) {
        User user = getUser(email);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        Note note = Note.builder()
                .user(user)
                .subject(subject)
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        return toResponse(noteRepository.save(note));
    }

    @Override
    public PageResponse<NoteResponse> getAllNotes(String email, Long subjectId, String keyword, int page, int size) {
        User user = getUser(email);
        String trimmedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        int safeSize = (size <= 0 || size > 100) ? 50 : size;
        int safePage = Math.max(page, 0);

        Page<Note> result = noteRepository.findByUserWithFilters(
                user, subjectId, trimmedKeyword, PageRequest.of(safePage, safeSize));

        return PageResponse.from(result.map(this::toResponse));
    }

    @Override
    public NoteResponse getNoteById(String email, Long id) {
        User user = getUser(email);
        return toResponse(getNoteForUser(id, user));
    }

    @Override
    @Transactional
    public NoteResponse updateNote(String email, Long id, NoteRequest request) {
        User user = getUser(email);
        Note note = getNoteForUser(id, user);
        Subject subject = resolveSubject(request.getSubjectId(), user);

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setSubject(subject);

        return toResponse(noteRepository.save(note));
    }

    @Override
    @Transactional
    public void deleteNote(String email, Long id) {
        User user = getUser(email);
        Note note = getNoteForUser(id, user);
        noteRepository.delete(note);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Note getNoteForUser(Long id, User user) {
        return noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
    }

    private Subject resolveSubject(Long subjectId, User user) {
        if (subjectId == null) return null;
        return subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private NoteResponse toResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .subjectId(note.getSubject() != null ? note.getSubject().getId() : null)
                .subjectName(note.getSubject() != null ? note.getSubject().getName() : null)
                .subjectColorHex(note.getSubject() != null ? note.getSubject().getColorHex() : null)
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
