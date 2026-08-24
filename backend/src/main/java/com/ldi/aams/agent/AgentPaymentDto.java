package com.ldi.aams.agent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class AgentPaymentDto {

    @Data
    @Builder
    public static class AgentPaymentResponse {
        private UUID id;
        private String agentNameRaw;
        private BigDecimal amount;
        private String currency;
        private Instant paymentDate;
        private String note;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    public static class CreateAgentPaymentRequest {
        @NotBlank(message = "Agent name is required")
        private String agentNameRaw;

        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        private String currency;

        @NotNull(message = "Payment date is required")
        private Instant paymentDate;

        private String note;
    }

    @Data
    public static class UpdateAgentPaymentRequest {
        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        private String currency;

        @NotNull(message = "Payment date is required")
        private Instant paymentDate;

        private String note;
    }
}
