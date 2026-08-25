package com.ldi.aams.agent.internal.balance;

import com.ldi.aams.agent.internal.Agent;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agent_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    @Column(name = "import_batch_id")
    private UUID importBatchId;

    @Column(name = "transaction_type", nullable = false, length = 30)
    private String transactionType; // OPENING_BALANCE, PASSENGER, PAYMENT, CURRENCY_TRANSFER

    @Column(name = "passenger_name")
    private String passengerName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "national_id", length = 50)
    private String nationalId;

    @Column(name = "passport_number", length = 50)
    private String passportNumber;

    @Column(name = "departure_port")
    private String departurePort;

    @Column(name = "destination")
    private String destination;

    @Column(name = "airline")
    private String airline;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "departure_time")
    private LocalTime departureTime;

    @Column(name = "investment_supplier")
    private String investmentSupplier;

    @Column(name = "service_type")
    private String serviceType;

    @Column(name = "passenger_category", length = 100)
    private String passengerCategory;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "note_2", columnDefinition = "TEXT")
    private String note2;

    @Column(name = "note_3", columnDefinition = "TEXT")
    private String note3;

    @Column(name = "payment_description", columnDefinition = "TEXT")
    private String paymentDescription;

    @Column(name = "debit_usd", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debitUsd = BigDecimal.ZERO;

    @Column(name = "credit_usd", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal creditUsd = BigDecimal.ZERO;

    @Column(name = "debit_egp", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debitEgp = BigDecimal.ZERO;

    @Column(name = "credit_egp", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal creditEgp = BigDecimal.ZERO;

    @Column(name = "source_sheet_name")
    private String sourceSheetName;

    @Column(name = "source_row_number")
    private Integer sourceRowNumber;

    @Column(name = "raw_column_a", columnDefinition = "TEXT")
    private String rawColumnA;

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
