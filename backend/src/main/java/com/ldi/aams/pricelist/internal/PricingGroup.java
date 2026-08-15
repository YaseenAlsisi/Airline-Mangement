package com.ldi.aams.pricelist.internal;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "price_list_groups")
public class PricingGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @Column(name = "departure_airport", nullable = false, length = 255)
    private String departureAirport;

    @Column(nullable = false, length = 255)
    private String destination;

    @OneToMany(mappedBy = "pricingGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PriceListEntry> entries = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PricingGroup() {}

    public PricingGroup(UUID id, PriceList priceList, String departureAirport, String destination,
                        List<PriceListEntry> entries, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.priceList = priceList;
        this.departureAirport = departureAirport;
        this.destination = destination;
        this.entries = entries != null ? entries : new ArrayList<>();
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public PriceList getPriceList() { return priceList; }
    public String getDepartureAirport() { return departureAirport; }
    public String getDestination() { return destination; }
    public List<PriceListEntry> getEntries() { return entries; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
    public void setDepartureAirport(String departureAirport) { this.departureAirport = departureAirport; }
    public void setDestination(String destination) { this.destination = destination; }
    public void setEntries(List<PriceListEntry> entries) { this.entries = entries; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private PriceList priceList;
        private String departureAirport;
        private String destination;
        private List<PriceListEntry> entries = new ArrayList<>();
        private Instant createdAt = Instant.now();
        private Instant updatedAt = Instant.now();

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder priceList(PriceList priceList) { this.priceList = priceList; return this; }
        public Builder departureAirport(String departureAirport) { this.departureAirport = departureAirport; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
        public Builder entries(List<PriceListEntry> entries) { this.entries = entries; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public PricingGroup build() {
            return new PricingGroup(id, priceList, departureAirport, destination, entries, createdAt, updatedAt);
        }
    }
}
