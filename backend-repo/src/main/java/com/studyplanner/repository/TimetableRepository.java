package com.studyplanner.repository;

import com.studyplanner.entity.Subject;
import com.studyplanner.entity.Timetable;
import com.studyplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    @Query("SELECT t FROM Timetable t LEFT JOIN FETCH t.subject WHERE t.id = :id AND t.user = :user")
    Optional<Timetable> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query("""
            SELECT t FROM Timetable t
            LEFT JOIN FETCH t.subject
            WHERE t.user = :user
            ORDER BY t.dayOfWeek ASC, t.startTime ASC
            """)
    List<Timetable> findByUserOrderByDayOfWeekAscStartTimeAsc(@Param("user") User user);

    @Query("""
            SELECT t FROM Timetable t
            LEFT JOIN FETCH t.subject
            WHERE t.user = :user AND t.dayOfWeek = :dayOfWeek
            ORDER BY t.startTime ASC
            """)
    List<Timetable> findByUserAndDayOfWeekOrderByStartTimeAsc(
            @Param("user") User user, @Param("dayOfWeek") DayOfWeek dayOfWeek);

    @Modifying
    @Query("DELETE FROM Timetable t WHERE t.subject = :subject")
    void deleteBySubject(@Param("subject") Subject subject);
}
