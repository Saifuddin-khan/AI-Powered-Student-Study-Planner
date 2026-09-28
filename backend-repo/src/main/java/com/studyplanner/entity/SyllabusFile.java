package com.studyplanner.entity;

import com.studyplanner.enums.SyllabusFileType;
import com.studyplanner.enums.SyllabusStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Subject subject;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 10)
    private SyllabusFileType fileType;

    @Column(name = "file_data", columnDefinition = "LONGTEXT", nullable = false)
    private String fileData;

    @Column(name = "extracted_text", columnDefinition = "LONGTEXT")
    private String extractedText;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 15)
    private SyllabusStatus status = SyllabusStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
