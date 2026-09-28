package com.studyplanner.repository;

import com.studyplanner.entity.PomodoroSession;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import com.studyplanner.enums.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {

    @Query("SELECT ps FROM PomodoroSession ps LEFT JOIN FETCH ps.subject WHERE ps.id = :id AND ps.user = :user")
    Optional<PomodoroSession> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query("SELECT ps FROM PomodoroSession ps LEFT JOIN FETCH ps.subject WHERE ps.user = :user ORDER BY ps.startedAt DESC")
    List<PomodoroSession> findByUserOrderByStartedAtDesc(@Param("user") User user);

    @Query("""
            SELECT ps FROM PomodoroSession ps
            LEFT JOIN FETCH ps.subject
            WHERE ps.user = :user AND ps.sessionType = :sessionType
            ORDER BY ps.startedAt DESC
            """)
    List<PomodoroSession> findByUserAndSessionTypeOrderByStartedAtDesc(
            @Param("user") User user, @Param("sessionType") SessionType sessionType);

    long countByUserAndIsCompletedTrue(User user);

    long countByIsCompletedTrue();

    long countByStartedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(ps.durationMinutes), 0) FROM PomodoroSession ps WHERE ps.isCompleted = true")
    long sumTotalDurationMinutes();

    @Modifying
    @Query("DELETE FROM PomodoroSession ps WHERE ps.subject = :subject")
    void deleteBySubject(@Param("subject") Subject subject);
}
