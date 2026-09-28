package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_sessions", indexes = {
    @Index(name = "idx_admin_id", columnList = "admin_id"),
    @Index(name = "idx_impersonated_user_id", columnList = "impersonated_user_id"),
    @Index(name = "idx_session_token", columnList = "session_token")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "impersonated_user_id", nullable = false)
    private User impersonatedUser;

    @Column(name = "session_token", unique = true, nullable = false)
    private String sessionToken;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
    }
}
