package com.studyplanner.repository;

import com.studyplanner.entity.Goal;
import com.studyplanner.entity.User;
import com.studyplanner.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    Optional<Goal> findByIdAndUser(Long id, User user);

    List<Goal> findByUserOrderByCreatedAtDesc(User user);

    List<Goal> findByUserAndStatusOrderByCreatedAtDesc(User user, GoalStatus status);

    long countByUserAndStatus(User user, GoalStatus status);

    long countByUser(User user);

    long countByUserAndStatusAndUpdatedAtAfter(User user, GoalStatus status, LocalDateTime after);

    @Query("SELECT COALESCE(AVG(g.progressPercent), 0) FROM Goal g WHERE g.user = :user")
    double averageProgressByUser(@Param("user") User user);
}
