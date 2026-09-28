package com.studyplanner.repository;

import com.studyplanner.entity.ProgressLog;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProgressLogRepository extends JpaRepository<ProgressLog, Long> {

    @Query("SELECT p FROM ProgressLog p LEFT JOIN FETCH p.subject WHERE p.id = :id AND p.user = :user")
    Optional<ProgressLog> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query("""
            SELECT p FROM ProgressLog p
            LEFT JOIN FETCH p.subject
            WHERE p.user = :user
              AND (:subjectId IS NULL OR p.subject.id = :subjectId)
              AND (:from IS NULL OR p.sessionDate >= :from)
              AND (:to IS NULL OR p.sessionDate <= :to)
            ORDER BY p.sessionDate DESC
            """)
    List<ProgressLog> findByUserWithFilters(
            @Param("user") User user,
            @Param("subjectId") Long subjectId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT p.subject.id, p.subject.name, p.subject.colorHex, COALESCE(SUM(p.durationMinutes), 0)
            FROM ProgressLog p
            WHERE p.user = :user AND p.subject IS NOT NULL
            GROUP BY p.subject.id, p.subject.name, p.subject.colorHex
            ORDER BY SUM(p.durationMinutes) DESC
            """)
    List<Object[]> getSubjectWiseDuration(@Param("user") User user);

    @Query("""
            SELECT COALESCE(SUM(p.durationMinutes), 0) FROM ProgressLog p
            WHERE p.user = :user
              AND p.sessionDate BETWEEN :from AND :to
            """)
    Integer sumDurationBetween(
            @Param("user") User user,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT COALESCE(SUM(p.durationMinutes), 0) FROM ProgressLog p
            WHERE p.user = :user
            """)
    Integer sumTotalDuration(@Param("user") User user);

    @Query("""
            SELECT p.sessionDate, COALESCE(SUM(p.durationMinutes), 0)
            FROM ProgressLog p
            WHERE p.user = :user
              AND p.sessionDate BETWEEN :from AND :to
            GROUP BY p.sessionDate
            ORDER BY p.sessionDate ASC
            """)
    List<Object[]> getDailyDurationBetween(
            @Param("user") User user,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Modifying
    @Query("DELETE FROM ProgressLog p WHERE p.subject = :subject")
    void deleteBySubject(@Param("subject") Subject subject);
}
