package com.ldi.aams.transaction.internal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ticket_number", unique = true, nullable = false, length = 50)
    private String ticketNumber;

    @Column(length = 10)
    private String pnr;

    @Column(name = "passenger_name")
    private String passengerName;

    @Column(name = "airline_id")
    private UUID airlineId;

    @Column(name = "agent_id")
    private UUID agentId;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "base_fare", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal baseFare = BigDecimal.ZERO;

    @Column(name = "tax", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(name = "total_fare", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalFare = BigDecimal.ZERO;

    @Column(name = "agent_commission", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal agentCommission = BigDecimal.ZERO;

    @Column(name = "net_payable", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal netPayable = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, CALCULATED, POSTED

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
