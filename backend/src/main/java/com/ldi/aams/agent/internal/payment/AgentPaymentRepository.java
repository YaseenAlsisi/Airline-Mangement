package com.ldi.aams.agent.internal.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AgentPaymentRepository extends JpaRepository<AgentPayment, UUID> {
    List<AgentPayment> findByAgentNameRawOrderByPaymentDateDesc(String agentNameRaw);
}
