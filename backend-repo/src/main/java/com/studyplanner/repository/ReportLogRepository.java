package com.studyplanner.repository;

import com.studyplanner.entity.ReportLog;
import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface ReportLogRepository extends JpaRepository<ReportLog, Long> {
    Page<ReportLog> findByGeneratedBy(User user, Pageable pageable);
    Page<ReportLog> findByReportType(String reportType, Pageable pageable);
    Page<ReportLog> findByGeneratedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    void deleteByGeneratedBy(User user);
}
