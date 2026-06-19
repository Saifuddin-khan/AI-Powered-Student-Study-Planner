package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_usage_logs", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_feature", columnList = "feature"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User user;

    @Column(name = "feature", nullable = false, length = 50)
    private String feature;  // "SYLLABUS_ANALYSIS", "QUIZ_GENERATION", "ANSWER_GRADING", "RECOMMENDATION"

    @Column(name = "tokens_used", nullable = false)
    private Integer tokensUsed;  // Input + output tokens

    @Column(name = "cost_estimate", nullable = false, precision = 10, scale = 6)
    private BigDecimal costEstimate;  // USD, e.g., 0.00145

    @Column(name = "status", nullable = false, length = 20)
    private String status;  // "SUCCESS", "FAILED", "PARTIAL"

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;  // If failed

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
