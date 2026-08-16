package com.ldi.aams.manifest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class ManifestDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchResponse {
        private UUID id;
        private String originalFilename;
        private String status;
        private Integer totalRows;
        private Integer validRows;
        private Integer invalidRows;
        private Instant publishedAt;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchPreviewResponse {
        private UUID id;
        private String status;
        private Integer totalRows;
        private Integer validRows;
        private Integer invalidRows;
        private List<PassengerRowResponse> rows;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerRowResponse {
        private UUID id;
        private UUID batchId;
        private Integer rowNumber;
        private String passengerName;
        private LocalDate birthDate;
        private String nationalId;
        private String passportNumber;
        private String departurePort;
        private String destination;
        private String flightNumber;
        private LocalDate departureDate;
        private LocalTime arrivalTime;
        private UUID agentId;
        private String agentNameRaw;
        private String investmentSupplier;
        private String serviceType;
        private String passengerCategory;
        private String note2;
        private String note3;
        private String note4;
        private BigDecimal debitUsd;
        private BigDecimal creditUsd;
        private BigDecimal debitEgp;
        private BigDecimal creditEgp;
        private BigDecimal regularPrice;
        private BigDecimal commission;
        private BigDecimal totalPrice;
        private String validationStatus;
        private String validationErrors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerRowUpdateRequest {
        private String passengerName;
        private LocalDate birthDate;
        private String nationalId;
        private String passportNumber;
        private String departurePort;
        private String destination;
        private String flightNumber;
        private LocalDate departureDate;
        private LocalTime arrivalTime;
        private String agentNameRaw;
        private String investmentSupplier;
        private String serviceType;
        private String passengerCategory;
        private String note2;
        private String note3;
        private String note4;
        private BigDecimal debitUsd;
        private BigDecimal creditUsd;
        private BigDecimal debitEgp;
        private BigDecimal creditEgp;
    }
}
