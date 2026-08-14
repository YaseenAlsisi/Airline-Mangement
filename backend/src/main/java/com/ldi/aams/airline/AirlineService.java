package com.ldi.aams.airline;

import com.ldi.aams.airline.internal.Airline;
import com.ldi.aams.airline.internal.AirlineMapper;
import com.ldi.aams.airline.internal.AirlineRepository;
import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AirlineService {

    private final AirlineRepository airlineRepository;
    private final AirlineMapper airlineMapper;

    @Transactional(readOnly = true)
    public Page<AirlineDto.AirlineResponse> getAllAirlines(Pageable pageable) {
        return airlineRepository.findAll(pageable).map(airlineMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AirlineDto.AirlineResponse getAirlineById(UUID id) {
        Airline airline = airlineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Airline", "id", id));
        return airlineMapper.toResponse(airline);
    }

    @Transactional
    public AirlineDto.AirlineResponse createAirline(AirlineDto.CreateAirlineRequest request) {
        if (airlineRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Airline code already exists", "AIRLINE_CODE_EXISTS");
        }
        if (request.getIataCode() != null && !request.getIataCode().isBlank() && airlineRepository.existsByIataCode(request.getIataCode())) {
            throw new BusinessException("Airline IATA code already exists", "AIRLINE_IATA_EXISTS");
        }
        if (request.getNumericCode() != null && !request.getNumericCode().isBlank() && airlineRepository.existsByNumericCode(request.getNumericCode())) {
            throw new BusinessException("Airline numeric code already exists", "AIRLINE_NUMERIC_EXISTS");
        }

        Airline airline = Airline.builder()
                .code(request.getCode())
                .name(request.getName())
                .iataCode(request.getIataCode())
                .numericCode(request.getNumericCode())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .settlementCurrency(request.getSettlementCurrency() != null ? request.getSettlementCurrency() : "USD")
                .build();

        return airlineMapper.toResponse(airlineRepository.save(airline));
    }

    @Transactional
    public AirlineDto.AirlineResponse updateAirline(UUID id, AirlineDto.UpdateAirlineRequest request) {
        Airline airline = airlineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Airline", "id", id));

        if (request.getIataCode() != null && !request.getIataCode().equals(airline.getIataCode()) && airlineRepository.existsByIataCode(request.getIataCode())) {
            throw new BusinessException("Airline IATA code already exists", "AIRLINE_IATA_EXISTS");
        }
        if (request.getNumericCode() != null && !request.getNumericCode().equals(airline.getNumericCode()) && airlineRepository.existsByNumericCode(request.getNumericCode())) {
            throw new BusinessException("Airline numeric code already exists", "AIRLINE_NUMERIC_EXISTS");
        }

        airline.setName(request.getName());
        airline.setIataCode(request.getIataCode());
        airline.setNumericCode(request.getNumericCode());
        
        if (request.getStatus() != null) {
            airline.setStatus(request.getStatus());
        }
        if (request.getSettlementCurrency() != null) {
            airline.setSettlementCurrency(request.getSettlementCurrency());
        }

        return airlineMapper.toResponse(airlineRepository.save(airline));
    }
}
