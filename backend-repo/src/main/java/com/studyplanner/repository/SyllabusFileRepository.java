package com.studyplanner.repository;

import com.studyplanner.entity.Subject;
import com.studyplanner.entity.SyllabusFile;
import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SyllabusFileRepository extends JpaRepository<SyllabusFile, Long> {

    @Query("SELECT s FROM SyllabusFile s LEFT JOIN FETCH s.subject WHERE s.id = :id AND s.user = :user")
    Optional<SyllabusFile> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query("SELECT s FROM SyllabusFile s LEFT JOIN FETCH s.subject WHERE s.id = :id")
    Optional<SyllabusFile> findByIdWithSubject(@Param("id") Long id);

    @Query(
        value = "SELECT s FROM SyllabusFile s LEFT JOIN FETCH s.subject WHERE s.subject = :subject ORDER BY s.createdAt DESC",
        countQuery = "SELECT COUNT(s) FROM SyllabusFile s WHERE s.subject = :subject"
    )
    Page<SyllabusFile> findBySubjectOrderByCreatedAtDesc(@Param("subject") Subject subject, Pageable pageable);

    @Modifying
    @Query("DELETE FROM SyllabusFile s WHERE s.subject = :subject")
    void deleteBySubject(@Param("subject") Subject subject);
}
