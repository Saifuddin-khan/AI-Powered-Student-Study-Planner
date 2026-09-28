package com.studyplanner.repository;

import com.studyplanner.entity.StudyStreak;
import com.studyplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudyStreakRepository extends JpaRepository<StudyStreak, Long> {

    Optional<StudyStreak> findByUser(User user);
}
