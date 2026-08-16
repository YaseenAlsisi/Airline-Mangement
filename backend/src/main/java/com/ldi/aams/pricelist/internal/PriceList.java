package com.ldi.aams.pricelist.internal;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "price_lists")
public class PriceList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;


    @Column(name = "agent_id")
    private UUID agentId;

    @Column(name = "commission_percentage", precision = 5, scale = 2)
    private BigDecimal commissionPercentage = BigDecimal.ZERO;

    @Column(name = "markup_amount", precision = 15, scale = 2)
    private BigDecimal markupAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE";

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "priceList", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PricingGroup> groups = new ArrayList<>();

    public PriceList() {}

    public PriceList(UUID id, String code, String name, UUID agentId,
                     BigDecimal commissionPercentage, BigDecimal markupAmount, String status,
                     LocalDate validFrom, LocalDate validTo, Instant createdAt, Instant updatedAt,
                     List<PricingGroup> groups) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.agentId = agentId;
        this.commissionPercentage = commissionPercentage != null ? commissionPercentage : BigDecimal.ZERO;
        this.markupAmount = markupAmount != null ? markupAmount : BigDecimal.ZERO;
        this.status = status != null ? status : "ACTIVE";
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
        this.groups = groups != null ? groups : new ArrayList<>();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters
    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public UUID getAgentId() { return agentId; }
    public BigDecimal getCommissionPercentage() { return commissionPercentage; }
    public BigDecimal getMarkupAmount() { return markupAmount; }
    public String getStatus() { return status; }
    public LocalDate getValidFrom() { return validFrom; }
    public LocalDate getValidTo() { return validTo; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<PricingGroup> getGroups() { return groups; }

    // Setters
    public void setId(UUID id) { this.id = id; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setAgentId(UUID agentId) { this.agentId = agentId; }
    public void setCommissionPercentage(BigDecimal commissionPercentage) { this.commissionPercentage = commissionPercentage; }
    public void setMarkupAmount(BigDecimal markupAmount) { this.markupAmount = markupAmount; }
    public void setStatus(String status) { this.status = status; }
    public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
    public void setValidTo(LocalDate validTo) { this.validTo = validTo; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public void setGroups(List<PricingGroup> groups) { this.groups = groups; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String code;
        private String name;
        private UUID agentId;
        private BigDecimal commissionPercentage = BigDecimal.ZERO;
        private BigDecimal markupAmount = BigDecimal.ZERO;
        private String status = "ACTIVE";
        private LocalDate validFrom;
        private LocalDate validTo;
        private Instant createdAt = Instant.now();
        private Instant updatedAt = Instant.now();
        private List<PricingGroup> groups = new ArrayList<>();

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder code(String code) { this.code = code; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder agentId(UUID agentId) { this.agentId = agentId; return this; }
        public Builder commissionPercentage(BigDecimal v) { this.commissionPercentage = v; return this; }
        public Builder markupAmount(BigDecimal v) { this.markupAmount = v; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder validFrom(LocalDate validFrom) { this.validFrom = validFrom; return this; }
        public Builder validTo(LocalDate validTo) { this.validTo = validTo; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder groups(List<PricingGroup> groups) { this.groups = groups; return this; }

        public PriceList build() {
            return new PriceList(id, code, name, agentId, commissionPercentage,
                    markupAmount, status, validFrom, validTo, createdAt, updatedAt, groups);
        }
    }

    @Override
    public String toString() {
        return "PriceList{id=" + id + ", code='" + code + "', name='" + name + "', status='" + status + "'}";
    }
}
