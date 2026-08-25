package com.ldi.aams.agent.internal.balance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentImportResult {
    private UUID batchId;
    private int totalAgents;
    private int totalTransactions;
    private int totalPassengers;
    private int totalPayments;
}
