package com.ldi.aams.agent;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class AgentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentResponse {
        private UUID id;
        private String code;
        private String name;
        private String email;
        private String phone;
        private String address;
        private String status;
        private BigDecimal creditLimit;
        private String currency;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAgentRequest {
        @NotBlank(message = "Code is required")
        private String code;

        @NotBlank(message = "Name is required")
        private String name;

        private String email;
        private String phone;
        private String address;
        private String status;
        private BigDecimal creditLimit;
        private String currency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateAgentRequest {
        @NotBlank(message = "Name is required")
        private String name;

        private String email;
        private String phone;
        private String address;
        private String status;
        private BigDecimal creditLimit;
        private String currency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentBalanceSummary {
        private Integer serialNumber;
        private UUID agentId;
        private String agentName;
        private String debtCategory;
        private BigDecimal totalDebitUsd;
        private BigDecimal totalCreditUsd;
        private BigDecimal debtUsd;
        private BigDecimal totalDebitEgp;
        private BigDecimal totalCreditEgp;
        private BigDecimal debtEgp;
        private BigDecimal ticketEquivalent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceReportResponse {
        private java.util.List<AgentBalanceSummary> agents;
        private java.util.List<AgentBalanceSummary> badDebts;
        private AgentBalanceSummary grandTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentTransactionResponse {
        private UUID id;
        private String transactionType;
        private boolean isImported;
        private String passengerName;
        private java.time.LocalDate birthDate;
        private String nationalId;
        private String passportNumber;
        private String departurePort;
        private String destination;
        private String airline;
        private java.time.LocalDate departureDate;
        private java.time.LocalTime departureTime;
        private String investmentSupplier;
        private String serviceType;
        private String passengerCategory;
        private String note;
        private String note2;
        private String note3;
        private String paymentDescription;
        private BigDecimal debitUsd;
        private BigDecimal creditUsd;
        private BigDecimal debitEgp;
        private BigDecimal creditEgp;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTransactionRequest {
        @NotBlank(message = "Transaction type is required")
        private String transactionType;
        
        private String passengerName;
        private java.time.LocalDate birthDate;
        private String nationalId;
        private String passportNumber;
        private String departurePort;
        private String destination;
        private String airline;
        private java.time.LocalDate departureDate;
        private java.time.LocalTime departureTime;
        private String investmentSupplier;
        private String serviceType;
        private String passengerCategory;
        private String note;
        private String note2;
        private String note3;
        private String paymentDescription;
        
        private BigDecimal debitUsd;
        private BigDecimal creditUsd;
        private BigDecimal debitEgp;
        private BigDecimal creditEgp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordPaymentRequest {
        @NotBlank(message = "Payment description is required")
        private String paymentDescription;
        
        private BigDecimal creditUsd;
        private BigDecimal creditEgp;
    }
}
