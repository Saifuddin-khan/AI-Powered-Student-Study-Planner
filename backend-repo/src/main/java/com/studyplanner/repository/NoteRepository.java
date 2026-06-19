package com.studyplanner.repository;

import com.studyplanner.entity.Note;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {

    @Query("SELECT n FROM Note n LEFT JOIN FETCH n.subject WHERE n.id = :id AND n.user = :user")
    Optional<Note> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query(
        value = """
            SELECT n FROM Note n
            LEFT JOIN FETCH n.subject
            WHERE n.user = :user
              AND (:subjectId IS NULL OR n.subject.id = :subjectId)
              AND (:keyword IS NULL
                   OR LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY n.updatedAt DESC
            """,
        countQuery = """
            SELECT COUNT(n) FROM Note n
            WHERE n.user = :user
              AND (:subjectId IS NULL OR n.subject.id = :subjectId)
              AND (:keyword IS NULL
                   OR LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """
    )
    Page<Note> findByUserWithFilters(
            @Param("user") User user,
            @Param("subjectId") Long subjectId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByUser(User user);

    @Query("SELECT n FROM Note n LEFT JOIN FETCH n.subject WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Note> findByQueryContainingIgnoreCase(@Param("query") String query, Pageable pageable);

    @Modifying
    @Query("DELETE FROM Note n WHERE n.subject = :subject")
    void deleteBySubject(@Param("subject") Subject subject);
}
