package com.ldi.aams.pricelist.internal;

import com.ldi.aams.pricelist.PriceListDto;
import org.springframework.stereotype.Component;

@Component
public class PriceListMapper {

    public PriceListDto.PriceListResponse toResponse(PriceList priceList) {
        return PriceListDto.PriceListResponse.builder()
                .id(priceList.getId())
                .code(priceList.getCode())
                .name(priceList.getName())
                .airlineId(priceList.getAirlineId())
                .agentId(priceList.getAgentId())
                .commissionPercentage(priceList.getCommissionPercentage())
                .markupAmount(priceList.getMarkupAmount())
                .status(priceList.getStatus())
                .validFrom(priceList.getValidFrom())
                .validTo(priceList.getValidTo())
                .createdAt(priceList.getCreatedAt())
                .updatedAt(priceList.getUpdatedAt())
                .entries(priceList.getEntries() != null ? priceList.getEntries().stream().map(this::toEntryResponse).toList() : java.util.Collections.emptyList())
                .build();
    }

    public PriceListDto.PriceListEntryResponse toEntryResponse(PriceListEntry entry) {
        return PriceListDto.PriceListEntryResponse.builder()
                .id(entry.getId())
                .departure(entry.getDeparture())
                .destination(entry.getDestination())
                .passengerType(entry.getPassengerType())
                .price(entry.getPrice())
                .commission(entry.getCommission())
                .currency(entry.getCurrency())
                .build();
    }
}
