package com.ldi.aams.manifest.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.UUID;

public interface ManifestImportBatchRepository extends JpaRepository<ManifestImportBatch, UUID> {
    @Modifying
    @Query("UPDATE ManifestImportBatch b SET b.status = 'DRAFT' WHERE b.status = 'PUBLISHED'")
    void updatePublishedBatchesToDraft();
}
