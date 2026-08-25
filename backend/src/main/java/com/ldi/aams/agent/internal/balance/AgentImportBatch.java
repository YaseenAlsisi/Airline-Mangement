package com.ldi.aams.agent.internal.balance;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agent_import_batches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentImportBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "total_agents", nullable = false)
    @Builder.Default
    private Integer totalAgents = 0;

    @Column(name = "total_transactions", nullable = false)
    @Builder.Default
    private Integer totalTransactions = 0;

    @Column(name = "total_passengers", nullable = false)
    @Builder.Default
    private Integer totalPassengers = 0;

    @Column(name = "total_payments", nullable = false)
    @Builder.Default
    private Integer totalPayments = 0;

    @Column(name = "imported_by")
    private UUID importedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
