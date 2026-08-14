package com.ldi.aams.transaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class TransactionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private UUID id;
        private String ticketNumber;
        private String pnr;
        private String passengerName;
        private UUID airlineId;
        private UUID agentId;
        private LocalDate issueDate;
        private BigDecimal baseFare;
        private BigDecimal tax;
        private BigDecimal totalFare;
        private BigDecimal agentCommission;
        private BigDecimal netPayable;
        private String status;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTransactionRequest {
        @NotBlank(message = "Ticket number is required")
        private String ticketNumber;

        private String pnr;
        private String passengerName;
        private UUID airlineId;
        private UUID agentId;
        
        @NotNull(message = "Issue date is required")
        private LocalDate issueDate;

        @NotNull(message = "Base fare is required")
        private BigDecimal baseFare;

        @NotNull(message = "Tax is required")
        private BigDecimal tax;
        
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTransactionRequest {
        private String pnr;
        private String passengerName;
        private UUID airlineId;
        private UUID agentId;
        
        @NotNull(message = "Issue date is required")
        private LocalDate issueDate;

        @NotNull(message = "Base fare is required")
        private BigDecimal baseFare;

        @NotNull(message = "Tax is required")
        private BigDecimal tax;
        
        private String status;
    }
}
