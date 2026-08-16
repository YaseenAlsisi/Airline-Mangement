package com.ldi.aams.pricelist.internal;

import com.ldi.aams.pricelist.PriceListDto;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class PriceListMapper {

    public PriceListDto.PriceListResponse toResponse(PriceList priceList) {
        return PriceListDto.PriceListResponse.builder()
                .id(priceList.getId())
                .code(priceList.getCode())
                .name(priceList.getName())
                .agentId(priceList.getAgentId())
                .commissionPercentage(priceList.getCommissionPercentage())
                .markupAmount(priceList.getMarkupAmount())
                .status(priceList.getStatus())
                .validFrom(priceList.getValidFrom())
                .validTo(priceList.getValidTo())
                .createdAt(priceList.getCreatedAt())
                .updatedAt(priceList.getUpdatedAt())
                .groups(priceList.getGroups() != null ? priceList.getGroups().stream().map(this::toGroupResponse).toList() : Collections.emptyList())
                .build();
    }

    public PriceListDto.PricingGroupResponse toGroupResponse(PricingGroup group) {
        return PriceListDto.PricingGroupResponse.builder()
                .id(group.getId())
                .departureAirport(group.getDepartureAirport())
                .destination(group.getDestination())
                .entries(group.getEntries() != null ? group.getEntries().stream().map(this::toEntryResponse).toList() : Collections.emptyList())
                .build();
    }

    public PriceListDto.PriceListEntryResponse toEntryResponse(PriceListEntry entry) {
        return PriceListDto.PriceListEntryResponse.builder()
                .id(entry.getId())
                .passengerType(entry.getPassengerType())
                .price(entry.getPrice())
                .commission(entry.getCommission())
                .currency(entry.getCurrency())
                .build();
    }
}
