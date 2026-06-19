package com.studyplanner.repository;

import com.studyplanner.entity.SyllabusFile;
import com.studyplanner.entity.Subject;
import com.studyplanner.entity.Task;
import com.studyplanner.entity.User;
import com.studyplanner.enums.Priority;
import com.studyplanner.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.subject LEFT JOIN FETCH t.syllabusTopic WHERE t.id = :id AND t.user = :user")
    Optional<Task> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query(
        value = """
            SELECT t FROM Task t
            LEFT JOIN FETCH t.subject
            WHERE t.user = :user
              AND (:statuses IS NULL OR t.status IN :statuses)
              AND (:priority IS NULL OR t.priority = :priority)
              AND (:subjectId IS NULL OR t.subject.id = :subjectId)
              AND (:dueDate IS NULL OR t.dueDate = :dueDate)
            ORDER BY t.createdAt DESC
            """,
        countQuery = """
            SELECT COUNT(t) FROM Task t
            WHERE t.user = :user
              AND (:statuses IS NULL OR t.status IN :statuses)
              AND (:priority IS NULL OR t.priority = :priority)
              AND (:subjectId IS NULL OR t.subject.id = :subjectId)
              AND (:dueDate IS NULL OR t.dueDate = :dueDate)
            """
    )
    Page<Task> findByUserWithFilters(
            @Param("user") User user,
            @Param("statuses") List<TaskStatus> statuses,
            @Param("priority") Priority priority,
            @Param("subjectId") Long subjectId,
            @Param("dueDate") LocalDate dueDate,
            Pageable pageable
    );

    List<Task> findByUserAndDueDateBetweenOrderByDueDateAsc(User user, LocalDate from, LocalDate to);

    long countByUserAndStatus(User user, TaskStatus status);

    long countByUser(User user);

    long countByUserAndDueDateAndStatusNot(User user, LocalDate dueDate, TaskStatus status);

    long countByUserAndDueDateBeforeAndStatusNot(User user, LocalDate date, TaskStatus status);

    @Modifying
    @Query("UPDATE Task t SET t.syllabusTopic = NULL WHERE t.syllabusTopic.syllabusFile = :syllabusFile")
    void clearSyllabusTopicLinks(@Param("syllabusFile") SyllabusFile syllabusFile);

    @Modifying
    @Query("DELETE FROM Task t WHERE t.subject = :subject")
    void deleteBySubject(@Param("subject") Subject subject);

    List<Task> findByUser(User user);

    long countByStatus(TaskStatus status);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.subject WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Task> findByTitleContainingIgnoreCase(@Param("query") String query, Pageable pageable);

    @Modifying
    @Query("DELETE FROM Task t WHERE t.user = :user")
    void deleteByUser(@Param("user") User user);
}
