package com.studyplanner.repository;

import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAllByOrderByCreatedAtDesc();

    long countByIsActiveTrue();

    long countByIsActiveFalse();

    long countByCreatedAtAfter(LocalDateTime date);

    long countByIsDisabledTrue();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND (u.isDisabled IS NULL OR u.isDisabled = false)")
    long countActiveAndNotDisabled();

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<User> searchByNameOrEmail(@Param("q") String q, Pageable pageable);
}
