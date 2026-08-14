package com.ldi.aams.airline.internal;

import com.ldi.aams.airline.AirlineDto;
import org.springframework.stereotype.Component;

@Component
public class AirlineMapper {

    public AirlineDto.AirlineResponse toResponse(Airline airline) {
        return AirlineDto.AirlineResponse.builder()
                .id(airline.getId())
                .code(airline.getCode())
                .name(airline.getName())
                .iataCode(airline.getIataCode())
                .numericCode(airline.getNumericCode())
                .status(airline.getStatus())
                .settlementCurrency(airline.getSettlementCurrency())
                .createdAt(airline.getCreatedAt())
                .updatedAt(airline.getUpdatedAt())
                .build();
    }
}
