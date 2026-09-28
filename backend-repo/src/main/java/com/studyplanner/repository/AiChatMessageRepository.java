package com.studyplanner.repository;

import com.studyplanner.entity.AiChatMessage;
import com.studyplanner.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {

    List<AiChatMessage> findByUserOrderByCreatedAtAsc(User user);

    Page<AiChatMessage> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    void deleteByUser(User user);
}
