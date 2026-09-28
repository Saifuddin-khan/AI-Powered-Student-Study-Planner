package com.studyplanner.repository;

import com.studyplanner.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findByKey(String key);
    boolean existsByKey(String key);
}
