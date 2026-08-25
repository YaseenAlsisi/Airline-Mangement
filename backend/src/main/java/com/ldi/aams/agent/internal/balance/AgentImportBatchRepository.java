package com.ldi.aams.agent.internal.balance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AgentImportBatchRepository extends JpaRepository<AgentImportBatch, UUID> {
    boolean existsByStatusNot(String status);
    List<AgentImportBatch> findByStatus(String status);
}
