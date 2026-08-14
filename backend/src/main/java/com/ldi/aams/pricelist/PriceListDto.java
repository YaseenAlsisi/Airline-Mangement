package com.ldi.aams.pricelist;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class PriceListDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceListResponse {
        private UUID id;
        private String code;
        private String name;
        private UUID airlineId;
        private UUID agentId;
        private BigDecimal commissionPercentage;
        private BigDecimal markupAmount;
        private String status;
        private LocalDate validFrom;
        private LocalDate validTo;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePriceListRequest {
        @NotBlank(message = "Code is required")
        private String code;

        @NotBlank(message = "Name is required")
        private String name;

        private UUID airlineId;
        private UUID agentId;
        private BigDecimal commissionPercentage;
        private BigDecimal markupAmount;
        private String status;
        private LocalDate validFrom;
        private LocalDate validTo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePriceListRequest {
        @NotBlank(message = "Name is required")
        private String name;

        private UUID airlineId;
        private UUID agentId;
        private BigDecimal commissionPercentage;
        private BigDecimal markupAmount;
        private String status;
        private LocalDate validFrom;
        private LocalDate validTo;
    }
}
