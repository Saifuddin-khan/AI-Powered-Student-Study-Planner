package com.studyplanner.repository;

import com.studyplanner.entity.User;
import com.studyplanner.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    Optional<UserSettings> findByUser(User user);
}
