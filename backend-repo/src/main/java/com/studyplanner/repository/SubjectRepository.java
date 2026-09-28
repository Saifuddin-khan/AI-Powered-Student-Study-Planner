package com.studyplanner.repository;

import com.studyplanner.entity.Subject;
import com.studyplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByUserOrderByCreatedAtDesc(User user);

    Optional<Subject> findByIdAndUser(Long id, User user);

    boolean existsByNameAndUser(String name, User user);

    boolean existsByNameAndUserAndIdNot(String name, User user, Long id);
}
