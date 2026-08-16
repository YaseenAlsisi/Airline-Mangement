package com.ldi.aams.manifest.internal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ManifestPassengerRepository extends JpaRepository<ManifestPassenger, UUID> {
    Page<ManifestPassenger> findByBatchId(UUID batchId, Pageable pageable);
    List<ManifestPassenger> findByBatchId(UUID batchId);
    List<ManifestPassenger> findByIdInAndBatchId(List<UUID> ids, UUID batchId);
    
    @Modifying
    @Query("DELETE FROM ManifestPassenger p WHERE p.batch.id = :batchId")
    void deleteByBatchId(@Param("batchId") UUID batchId);

    List<ManifestPassenger> findByPassportNumber(String passportNumber);
    List<ManifestPassenger> findByPassengerName(String passengerName);
    List<ManifestPassenger> findByPassportNumberIn(java.util.Collection<String> passportNumbers);
    List<ManifestPassenger> findByPassengerNameIn(java.util.Collection<String> passengerNames);
}
