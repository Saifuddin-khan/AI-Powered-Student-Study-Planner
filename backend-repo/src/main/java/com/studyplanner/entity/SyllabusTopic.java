package com.studyplanner.entity;

import com.studyplanner.enums.DifficultyLevel;
import com.studyplanner.enums.MasteryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_file_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private SyllabusFile syllabusFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Subject subject;

    @Column(name = "unit_name", length = 255)
    private String unitName;

    @Column(name = "chapter_name", length = 255)
    private String chapterName;

    @Column(name = "topic_name", nullable = false, length = 255)
    private String topicName;

    @Builder.Default
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "difficulty_level", nullable = false, length = 10)
    private DifficultyLevel difficultyLevel = DifficultyLevel.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "mastery_status", nullable = false, length = 20)
    private MasteryStatus masteryStatus = MasteryStatus.NOT_STARTED;

    @Builder.Default
    @Column(name = "progress_percent", nullable = false)
    private Integer progressPercent = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
