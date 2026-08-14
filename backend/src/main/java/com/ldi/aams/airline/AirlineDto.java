package com.ldi.aams.airline;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

public class AirlineDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AirlineResponse {
        private UUID id;
        private String code;
        private String name;
        private String iataCode;
        private String numericCode;
        private String status;
        private String settlementCurrency;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAirlineRequest {
        @NotBlank(message = "Code is required")
        private String code;

        @NotBlank(message = "Name is required")
        private String name;

        private String iataCode;
        private String numericCode;
        private String status;
        private String settlementCurrency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateAirlineRequest {
        @NotBlank(message = "Name is required")
        private String name;

        private String iataCode;
        private String numericCode;
        private String status;
        private String settlementCurrency;
    }
}
