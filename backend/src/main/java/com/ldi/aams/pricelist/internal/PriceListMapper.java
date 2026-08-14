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
                .build();
    }
}
