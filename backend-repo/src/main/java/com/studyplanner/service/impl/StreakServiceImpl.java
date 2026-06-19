package com.studyplanner.service.impl;

import com.studyplanner.dto.response.StudyStreakResponse;
import com.studyplanner.entity.StudyStreak;
import com.studyplanner.entity.User;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.StudyStreakRepository;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.StreakService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class StreakServiceImpl implements StreakService {

    private final StudyStreakRepository studyStreakRepository;
    private final UserRepository userRepository;

    public StreakServiceImpl(StudyStreakRepository studyStreakRepository,
                             UserRepository userRepository) {
        this.studyStreakRepository = studyStreakRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StudyStreakResponse getStreak(String email) {
        User user = getUser(email);
        StudyStreak streak = studyStreakRepository.findByUser(user)
                .orElseGet(() -> createInitialStreak(user));
        return toResponse(streak);
    }

    @Override
    @Transactional
    public void updateStreak(String email) {
        User user = getUser(email);
        LocalDate today = LocalDate.now();

        StudyStreak streak = studyStreakRepository.findByUser(user)
                .orElseGet(() -> createInitialStreak(user));

        LocalDate lastActivity = streak.getLastActivityDate();

        if (lastActivity != null && lastActivity.equals(today)) {
            return;
        }

        if (lastActivity != null && lastActivity.equals(today.minusDays(1))) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else {
            streak.setCurrentStreak(1);
        }

        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }

        streak.setLastActivityDate(today);
        studyStreakRepository.save(streak);
    }

    private StudyStreak createInitialStreak(User user) {
        StudyStreak streak = StudyStreak.builder()
                .user(user)
                .build();
        return studyStreakRepository.save(streak);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private StudyStreakResponse toResponse(StudyStreak streak) {
        return StudyStreakResponse.builder()
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .lastActivityDate(streak.getLastActivityDate())
                .updatedAt(streak.getUpdatedAt())
                .build();
    }
}
