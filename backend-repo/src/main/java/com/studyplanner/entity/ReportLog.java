package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_logs", indexes = {
    @Index(name = "idx_generated_by", columnList = "generated_by"),
    @Index(name = "idx_report_type", columnList = "report_type"),
    @Index(name = "idx_generated_at", columnList = "generated_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by", nullable = false)
    private User generatedBy;

    @Column(name = "report_type", nullable = false)
    private String reportType;

    @Column(name = "report_name")
    private String reportName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_format")
    private String fileFormat;

    @Column(name = "record_count")
    private Integer recordCount;

    @Column(name = "filters")
    private String filters;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @Column(name = "downloaded_at")
    private LocalDateTime downloadedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
