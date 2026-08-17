package com.ldi.aams.manifest.internal;

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
@Table(name = "manifest_passengers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManifestPassenger {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private ManifestImportBatch batch;

    @Column(name = "row_number", nullable = false)
    private Integer rowNumber;

    @Column(name = "passenger_name", nullable = false)
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

    @Column(name = "flight_number", length = 100)
    private String flightNumber;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "arrival_time")
    private LocalTime arrivalTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @Column(name = "agent_name_raw")
    private String agentNameRaw;

    @Column(name = "investment_supplier")
    private String investmentSupplier;

    @Column(name = "service_type")
    private String serviceType;

    @Column(name = "passenger_category", length = 100)
    private String passengerCategory;

    @Column(name = "note_2", columnDefinition = "TEXT")
    private String note2;

    @Column(name = "note_3", columnDefinition = "TEXT")
    private String note3;

    @Column(name = "note_4", columnDefinition = "TEXT")
    private String note4;

    @Column(name = "debit_usd", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debitUsd = BigDecimal.ZERO;

    @Column(name = "credit_usd", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal creditUsd = BigDecimal.ZERO;

    @Column(name = "debit_egp", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal debitEgp = BigDecimal.ZERO;

    @Column(name = "credit_egp", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal creditEgp = BigDecimal.ZERO;

    @Column(name = "credit_egp_date")
    private Instant creditEgpDate;

    @Column(name = "regular_price", precision = 15, scale = 2)
    private BigDecimal regularPrice;

    @Column(name = "commission", precision = 15, scale = 2)
    private BigDecimal commission;

    @Column(name = "total_price", precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "validation_status", nullable = false, length = 50)
    @Builder.Default
    private String validationStatus = "VALID"; // VALID, WARNING, ERROR

    @Column(name = "validation_errors", columnDefinition = "TEXT")
    private String validationErrors;

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
