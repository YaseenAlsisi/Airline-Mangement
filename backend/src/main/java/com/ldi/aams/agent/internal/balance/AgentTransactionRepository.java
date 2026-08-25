package com.ldi.aams.agent.internal.balance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AgentTransactionRepository extends JpaRepository<AgentTransaction, UUID> {
    
    Page<AgentTransaction> findByAgentId(UUID agentId, Pageable pageable);
    
    Page<AgentTransaction> findByAgentIdAndTransactionType(UUID agentId, String transactionType, Pageable pageable);
    
    List<AgentTransaction> findByImportBatchId(UUID importBatchId);
    
    @Modifying
    @Query("DELETE FROM AgentTransaction t WHERE t.importBatchId = :importBatchId")
    void deleteByImportBatchId(@Param("importBatchId") UUID importBatchId);
    
    boolean existsByImportBatchId(UUID importBatchId);
    
    @Query("SELECT new com.ldi.aams.agent.AgentDto$AgentBalanceSummary(" +
           "CAST(null AS int), a.id, a.name, a.debtCategory, " +
           "COALESCE(SUM(t.debitUsd), 0), COALESCE(SUM(t.creditUsd), 0), " +
           "COALESCE(SUM(t.debitUsd), 0) - COALESCE(SUM(t.creditUsd), 0), " +
           "COALESCE(SUM(t.debitEgp), 0), COALESCE(SUM(t.creditEgp), 0), " +
           "COALESCE(SUM(t.debitEgp), 0) - COALESCE(SUM(t.creditEgp), 0), " +
           "CAST(null AS big_decimal)) " +
           "FROM Agent a LEFT JOIN AgentTransaction t ON t.agent = a " +
           "WHERE a.status != 'DELETED' " +
           "GROUP BY a.id, a.name, a.debtCategory " +
           "ORDER BY a.name")
    List<com.ldi.aams.agent.AgentDto.AgentBalanceSummary> calculateAllAgentBalances();
}
