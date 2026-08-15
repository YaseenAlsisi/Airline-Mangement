package com.ldi.aams.pricelist;

import com.ldi.aams.pricelist.internal.PassengerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class PriceListDto {

    public static class PriceListEntryResponse {
        private UUID id;
        private PassengerType passengerType;
        private BigDecimal price;
        private BigDecimal commission;
        private String currency;

        public PriceListEntryResponse() {}

        public PriceListEntryResponse(UUID id, PassengerType passengerType, BigDecimal price,
                                      BigDecimal commission, String currency) {
            this.id = id;
            this.passengerType = passengerType;
            this.price = price;
            this.commission = commission;
            this.currency = currency;
        }

        public UUID getId() { return id; }
        public PassengerType getPassengerType() { return passengerType; }
        public BigDecimal getPrice() { return price; }
        public BigDecimal getCommission() { return commission; }
        public String getCurrency() { return currency; }

        public void setId(UUID id) { this.id = id; }
        public void setPassengerType(PassengerType passengerType) { this.passengerType = passengerType; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public void setCommission(BigDecimal commission) { this.commission = commission; }
        public void setCurrency(String currency) { this.currency = currency; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private PassengerType passengerType;
            private BigDecimal price;
            private BigDecimal commission;
            private String currency;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder passengerType(PassengerType passengerType) { this.passengerType = passengerType; return this; }
            public Builder price(BigDecimal price) { this.price = price; return this; }
            public Builder commission(BigDecimal commission) { this.commission = commission; return this; }
            public Builder currency(String currency) { this.currency = currency; return this; }

            public PriceListEntryResponse build() {
                return new PriceListEntryResponse(id, passengerType, price, commission, currency);
            }
        }
    }

    public static class PricingGroupResponse {
        private UUID id;
        private String departureAirport;
        private String destination;
        private List<PriceListEntryResponse> entries;

        public PricingGroupResponse() {}

        public PricingGroupResponse(UUID id, String departureAirport, String destination, List<PriceListEntryResponse> entries) {
            this.id = id;
            this.departureAirport = departureAirport;
            this.destination = destination;
            this.entries = entries;
        }

        public UUID getId() { return id; }
        public String getDepartureAirport() { return departureAirport; }
        public String getDestination() { return destination; }
        public List<PriceListEntryResponse> getEntries() { return entries; }

        public void setId(UUID id) { this.id = id; }
        public void setDepartureAirport(String departureAirport) { this.departureAirport = departureAirport; }
        public void setDestination(String destination) { this.destination = destination; }
        public void setEntries(List<PriceListEntryResponse> entries) { this.entries = entries; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private String departureAirport;
            private String destination;
            private List<PriceListEntryResponse> entries;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder departureAirport(String departureAirport) { this.departureAirport = departureAirport; return this; }
            public Builder destination(String destination) { this.destination = destination; return this; }
            public Builder entries(List<PriceListEntryResponse> entries) { this.entries = entries; return this; }

            public PricingGroupResponse build() {
                return new PricingGroupResponse(id, departureAirport, destination, entries);
            }
        }
    }

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
        private List<PricingGroupResponse> groups;

        public PriceListResponse() {}

        public PriceListResponse(UUID id, String code, String name, UUID airlineId, UUID agentId,
                                  BigDecimal commissionPercentage, BigDecimal markupAmount, String status,
                                  LocalDate validFrom, LocalDate validTo, Instant createdAt,
                                  Instant updatedAt, List<PricingGroupResponse> groups) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.airlineId = airlineId;
            this.agentId = agentId;
            this.commissionPercentage = commissionPercentage;
            this.markupAmount = markupAmount;
            this.status = status;
            this.validFrom = validFrom;
            this.validTo = validTo;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.groups = groups;
        }

        public UUID getId() { return id; }
        public String getCode() { return code; }
        public String getName() { return name; }
        public UUID getAirlineId() { return airlineId; }
        public UUID getAgentId() { return agentId; }
        public BigDecimal getCommissionPercentage() { return commissionPercentage; }
        public BigDecimal getMarkupAmount() { return markupAmount; }
        public String getStatus() { return status; }
        public LocalDate getValidFrom() { return validFrom; }
        public LocalDate getValidTo() { return validTo; }
        public Instant getCreatedAt() { return createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public List<PricingGroupResponse> getGroups() { return groups; }

        public void setId(UUID id) { this.id = id; }
        public void setCode(String code) { this.code = code; }
        public void setName(String name) { this.name = name; }
        public void setAirlineId(UUID airlineId) { this.airlineId = airlineId; }
        public void setAgentId(UUID agentId) { this.agentId = agentId; }
        public void setCommissionPercentage(BigDecimal v) { this.commissionPercentage = v; }
        public void setMarkupAmount(BigDecimal v) { this.markupAmount = v; }
        public void setStatus(String status) { this.status = status; }
        public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
        public void setValidTo(LocalDate validTo) { this.validTo = validTo; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
        public void setGroups(List<PricingGroupResponse> groups) { this.groups = groups; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
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
            private List<PricingGroupResponse> groups;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder code(String code) { this.code = code; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder airlineId(UUID airlineId) { this.airlineId = airlineId; return this; }
            public Builder agentId(UUID agentId) { this.agentId = agentId; return this; }
            public Builder commissionPercentage(BigDecimal v) { this.commissionPercentage = v; return this; }
            public Builder markupAmount(BigDecimal v) { this.markupAmount = v; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder validFrom(LocalDate validFrom) { this.validFrom = validFrom; return this; }
            public Builder validTo(LocalDate validTo) { this.validTo = validTo; return this; }
            public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
            public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
            public Builder groups(List<PricingGroupResponse> groups) { this.groups = groups; return this; }

            public PriceListResponse build() {
                return new PriceListResponse(id, code, name, airlineId, agentId, commissionPercentage,
                        markupAmount, status, validFrom, validTo, createdAt, updatedAt, groups);
            }
        }
    }

    public static class CreatePriceListEntryRequest {
        @NotNull(message = "Passenger type is required")
        private PassengerType passengerType;

        @NotNull(message = "Price is required")
        private BigDecimal price;

        @NotNull(message = "Commission is required")
        private BigDecimal commission;
        
        private String currency;

        public CreatePriceListEntryRequest() {}

        public CreatePriceListEntryRequest(PassengerType passengerType, BigDecimal price, BigDecimal commission, String currency) {
            this.passengerType = passengerType;
            this.price = price;
            this.commission = commission;
            this.currency = currency;
        }

        public PassengerType getPassengerType() { return passengerType; }
        public BigDecimal getPrice() { return price; }
        public BigDecimal getCommission() { return commission; }
        public String getCurrency() { return currency; }

        public void setPassengerType(PassengerType passengerType) { this.passengerType = passengerType; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public void setCommission(BigDecimal commission) { this.commission = commission; }
        public void setCurrency(String currency) { this.currency = currency; }
    }

    public static class CreatePricingGroupRequest {
        @NotBlank(message = "Departure is required")
        private String departureAirport;

        @NotBlank(message = "Destination is required")
        private String destination;

        @Valid
        private List<CreatePriceListEntryRequest> entries;

        public CreatePricingGroupRequest() {}

        public CreatePricingGroupRequest(String departureAirport, String destination, List<CreatePriceListEntryRequest> entries) {
            this.departureAirport = departureAirport;
            this.destination = destination;
            this.entries = entries;
        }

        public String getDepartureAirport() { return departureAirport; }
        public String getDestination() { return destination; }
        public List<CreatePriceListEntryRequest> getEntries() { return entries; }

        public void setDepartureAirport(String departureAirport) { this.departureAirport = departureAirport; }
        public void setDestination(String destination) { this.destination = destination; }
        public void setEntries(List<CreatePriceListEntryRequest> entries) { this.entries = entries; }
    }


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
        
        @Valid
        private List<CreatePricingGroupRequest> groups;

        public CreatePriceListRequest() {}

        public CreatePriceListRequest(String code, String name, UUID airlineId, UUID agentId,
                                       BigDecimal commissionPercentage, BigDecimal markupAmount,
                                       String status, LocalDate validFrom, LocalDate validTo,
                                       List<CreatePricingGroupRequest> groups) {
            this.code = code;
            this.name = name;
            this.airlineId = airlineId;
            this.agentId = agentId;
            this.commissionPercentage = commissionPercentage;
            this.markupAmount = markupAmount;
            this.status = status;
            this.validFrom = validFrom;
            this.validTo = validTo;
            this.groups = groups;
        }

        public String getCode() { return code; }
        public String getName() { return name; }
        public UUID getAirlineId() { return airlineId; }
        public UUID getAgentId() { return agentId; }
        public BigDecimal getCommissionPercentage() { return commissionPercentage; }
        public BigDecimal getMarkupAmount() { return markupAmount; }
        public String getStatus() { return status; }
        public LocalDate getValidFrom() { return validFrom; }
        public LocalDate getValidTo() { return validTo; }
        public List<CreatePricingGroupRequest> getGroups() { return groups; }

        public void setCode(String code) { this.code = code; }
        public void setName(String name) { this.name = name; }
        public void setAirlineId(UUID airlineId) { this.airlineId = airlineId; }
        public void setAgentId(UUID agentId) { this.agentId = agentId; }
        public void setCommissionPercentage(BigDecimal v) { this.commissionPercentage = v; }
        public void setMarkupAmount(BigDecimal v) { this.markupAmount = v; }
        public void setStatus(String status) { this.status = status; }
        public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
        public void setValidTo(LocalDate validTo) { this.validTo = validTo; }
        public void setGroups(List<CreatePricingGroupRequest> groups) { this.groups = groups; }
    }

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
        
        @Valid
        private List<CreatePricingGroupRequest> groups;

        public UpdatePriceListRequest() {}

        public UpdatePriceListRequest(String name, UUID airlineId, UUID agentId,
                                       BigDecimal commissionPercentage, BigDecimal markupAmount,
                                       String status, LocalDate validFrom, LocalDate validTo,
                                       List<CreatePricingGroupRequest> groups) {
            this.name = name;
            this.airlineId = airlineId;
            this.agentId = agentId;
            this.commissionPercentage = commissionPercentage;
            this.markupAmount = markupAmount;
            this.status = status;
            this.validFrom = validFrom;
            this.validTo = validTo;
            this.groups = groups;
        }

        public String getName() { return name; }
        public UUID getAirlineId() { return airlineId; }
        public UUID getAgentId() { return agentId; }
        public BigDecimal getCommissionPercentage() { return commissionPercentage; }
        public BigDecimal getMarkupAmount() { return markupAmount; }
        public String getStatus() { return status; }
        public LocalDate getValidFrom() { return validFrom; }
        public LocalDate getValidTo() { return validTo; }
        public List<CreatePricingGroupRequest> getGroups() { return groups; }

        public void setName(String name) { this.name = name; }
        public void setAirlineId(UUID airlineId) { this.airlineId = airlineId; }
        public void setAgentId(UUID agentId) { this.agentId = agentId; }
        public void setCommissionPercentage(BigDecimal v) { this.commissionPercentage = v; }
        public void setMarkupAmount(BigDecimal v) { this.markupAmount = v; }
        public void setStatus(String status) { this.status = status; }
        public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
        public void setValidTo(LocalDate validTo) { this.validTo = validTo; }
        public void setGroups(List<CreatePricingGroupRequest> groups) { this.groups = groups; }
    }
}
