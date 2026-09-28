package com.studyplanner.repository;

import com.studyplanner.entity.StudyPlan;
import com.studyplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {

    @Query("SELECT sp FROM StudyPlan sp LEFT JOIN FETCH sp.subject WHERE sp.id = :id AND sp.user = :user")
    Optional<StudyPlan> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query("""
            SELECT sp FROM StudyPlan sp
            LEFT JOIN FETCH sp.subject
            WHERE sp.user = :user AND sp.planDate = :planDate
            ORDER BY sp.planDate ASC
            """)
    List<StudyPlan> findByUserAndPlanDateOrderByPlanDateAsc(
            @Param("user") User user, @Param("planDate") LocalDate planDate);

    @Query("""
            SELECT sp FROM StudyPlan sp
            LEFT JOIN FETCH sp.subject
            WHERE sp.user = :user AND sp.planDate BETWEEN :from AND :to
            ORDER BY sp.planDate ASC
            """)
    List<StudyPlan> findByUserAndPlanDateBetweenOrderByPlanDateAsc(
            @Param("user") User user, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
            SELECT COALESCE(SUM(sp.durationMinutes), 0) FROM StudyPlan sp
            WHERE sp.user = :user
              AND sp.planDate BETWEEN :from AND :to
              AND sp.isCompleted = true
            """)
    Integer sumCompletedDurationBetween(
            @Param("user") User user,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
