package com.ldi.aams.manifest.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ManifestImportBatchRepository extends JpaRepository<ManifestImportBatch, UUID> {
}
