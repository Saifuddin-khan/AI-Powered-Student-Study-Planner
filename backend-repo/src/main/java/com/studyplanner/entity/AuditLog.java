package com.studyplanner.entity;

import com.studyplanner.enums.AuditAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_email", nullable = false, length = 150)
    private String actorEmail;

    @Column(name = "actor_name", length = 150)
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditAction action;

    @Column(name = "target_email", length = 150)
    private String targetEmail;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
