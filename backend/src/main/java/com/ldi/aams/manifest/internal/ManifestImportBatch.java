package com.ldi.aams.manifest.internal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "manifest_import_batches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManifestImportBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, PUBLISHED, CANCELLED

    @Column(name = "total_rows", nullable = false)
    @Builder.Default
    private Integer totalRows = 0;

    @Column(name = "valid_rows", nullable = false)
    @Builder.Default
    private Integer validRows = 0;

    @Column(name = "invalid_rows", nullable = false)
    @Builder.Default
    private Integer invalidRows = 0;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
