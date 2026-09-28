package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_streaks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Builder.Default
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Builder.Default
    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
