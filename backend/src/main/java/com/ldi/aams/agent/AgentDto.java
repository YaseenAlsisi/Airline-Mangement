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
}
