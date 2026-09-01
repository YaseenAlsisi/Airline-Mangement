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

    @Modifying
    @Query("UPDATE ManifestPassenger p SET p.agent = null WHERE p.agent.id = :agentId")
    void unlinkAgent(@Param("agentId") UUID agentId);

    List<ManifestPassenger> findByPassportNumber(String passportNumber);
    List<ManifestPassenger> findByPassengerName(String passengerName);
    List<ManifestPassenger> findByPassportNumberIn(java.util.Collection<String> passportNumbers);
    List<ManifestPassenger> findByPassengerNameIn(java.util.Collection<String> passengerNames);

    @Query(value = "SELECT p FROM ManifestPassenger p LEFT JOIN FETCH p.agent LEFT JOIN FETCH p.batch WHERE p.agent.id = :agentId AND p.batch.status = 'PUBLISHED' AND p.validationStatus = 'VALID'",
           countQuery = "SELECT COUNT(p) FROM ManifestPassenger p WHERE p.agent.id = :agentId AND p.batch.status = 'PUBLISHED' AND p.validationStatus = 'VALID'")
    Page<ManifestPassenger> findPublishedAndValidByAgentId(@Param("agentId") UUID agentId, Pageable pageable);

    @Query(value = "SELECT p FROM ManifestPassenger p LEFT JOIN FETCH p.agent LEFT JOIN FETCH p.batch WHERE p.batch.status = 'PUBLISHED' AND p.validationStatus = 'VALID'",
           countQuery = "SELECT COUNT(p) FROM ManifestPassenger p WHERE p.batch.status = 'PUBLISHED' AND p.validationStatus = 'VALID'")
    Page<ManifestPassenger> findAllPublishedAndValid(Pageable pageable);

    @Query("SELECT new map(p.agent.id as agentId, p.agent.name as agentName, COUNT(p.id) as passengerCount) " +
           "FROM ManifestPassenger p WHERE p.agent IS NOT NULL AND p.batch.status = 'PUBLISHED' AND p.validationStatus = 'VALID' " +
           "GROUP BY p.agent.id, p.agent.name")
    List<java.util.Map<String, Object>> getManifestSummary();
}
