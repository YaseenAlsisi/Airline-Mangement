package com.ldi.aams.pricelist.internal;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "price_list_entries")
public class PriceListEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pricing_group_id", nullable = false)
    private PricingGroup pricingGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "passenger_type", nullable = false, length = 50)
    private PassengerType passengerType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(nullable = false, length = 10)
    private String currency = "EGP";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PriceListEntry() {}

    public PriceListEntry(UUID id, PricingGroup pricingGroup, PassengerType passengerType, 
                          BigDecimal price, BigDecimal commission,
                          String currency, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.pricingGroup = pricingGroup;
        this.passengerType = passengerType;
        this.price = price != null ? price : BigDecimal.ZERO;
        this.commission = commission != null ? commission : BigDecimal.ZERO;
        this.currency = currency != null ? currency : "EGP";
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters
    public UUID getId() { return id; }
    public PricingGroup getPricingGroup() { return pricingGroup; }
    public PassengerType getPassengerType() { return passengerType; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getCommission() { return commission; }
    public String getCurrency() { return currency; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(UUID id) { this.id = id; }
    public void setPricingGroup(PricingGroup pricingGroup) { this.pricingGroup = pricingGroup; }
    public void setPassengerType(PassengerType passengerType) { this.passengerType = passengerType; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setCommission(BigDecimal commission) { this.commission = commission; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private PricingGroup pricingGroup;
        private PassengerType passengerType;
        private BigDecimal price = BigDecimal.ZERO;
        private BigDecimal commission = BigDecimal.ZERO;
        private String currency = "EGP";
        private Instant createdAt = Instant.now();
        private Instant updatedAt = Instant.now();

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder pricingGroup(PricingGroup pricingGroup) { this.pricingGroup = pricingGroup; return this; }
        public Builder passengerType(PassengerType passengerType) { this.passengerType = passengerType; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder commission(BigDecimal commission) { this.commission = commission; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public PriceListEntry build() {
            return new PriceListEntry(id, pricingGroup, passengerType, price, commission, currency, createdAt, updatedAt);
        }
    }

    @Override
    public String toString() {
        return "PriceListEntry{id=" + id + ", passengerType=" + passengerType + ", price=" + price + "}";
    }
}
