package com.ldi.aams.manifest.internal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ManifestPassengerRepository extends JpaRepository<ManifestPassenger, UUID> {
    Page<ManifestPassenger> findByBatchId(UUID batchId, Pageable pageable);
    List<ManifestPassenger> findByBatchId(UUID batchId);
    List<ManifestPassenger> findByPassportNumber(String passportNumber);
    List<ManifestPassenger> findByPassengerName(String passengerName);
}
