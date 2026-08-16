package com.ldi.aams.pricelist;

import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import com.ldi.aams.pricelist.internal.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class PriceListService {

    private final PriceListRepository priceListRepository;
    private final PriceListMapper priceListMapper;

    public PriceListService(PriceListRepository priceListRepository, PriceListMapper priceListMapper) {
        this.priceListRepository = priceListRepository;
        this.priceListMapper = priceListMapper;
    }

    @Transactional(readOnly = true)
    public Page<PriceListDto.PriceListResponse> getAllPriceLists(Pageable pageable) {
        return priceListRepository.findAll(pageable).map(priceListMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PriceListDto.PriceListResponse getPriceListById(UUID id) {
        PriceList priceList = priceListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PriceList", "id", id));
        return priceListMapper.toResponse(priceList);
    }

    @Transactional(readOnly = true)
    public PriceListDto.PriceListResponse findBestPriceList(UUID agentId, UUID airlineId, LocalDate issueDate) {
        List<PriceList> applicable = priceListRepository.findApplicablePriceLists(agentId, airlineId, issueDate);
        if (applicable.isEmpty()) {
            return null;
        }

        PriceList best = applicable.stream().max(Comparator.comparingInt(p -> 
            (p.getAgentId() != null ? 2 : 0) + (p.getAirlineId() != null ? 1 : 0)
        )).orElse(null);

        return best != null ? priceListMapper.toResponse(best) : null;
    }

    @Transactional
    public PriceListDto.PriceListResponse createPriceList(PriceListDto.CreatePriceListRequest request) {
        if (priceListRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Price list code already exists", "PRICELIST_CODE_EXISTS");
        }
        
        if (request.getValidFrom() != null && request.getValidTo() != null && request.getValidFrom().isAfter(request.getValidTo())) {
             throw new BusinessException("Valid from date must be before or equal to valid to date", "INVALID_DATES");
        }

        PriceList priceList = PriceList.builder()
                .code(request.getCode())
                .name(request.getName())
                .agentId(request.getAgentId())
                .commissionPercentage(request.getCommissionPercentage() != null ? request.getCommissionPercentage() : BigDecimal.ZERO)
                .markupAmount(request.getMarkupAmount() != null ? request.getMarkupAmount() : BigDecimal.ZERO)
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .build();

        if (request.getGroups() != null) {
            for (PriceListDto.CreatePricingGroupRequest groupReq : request.getGroups()) {
                if (groupReq.getDepartureAirport() == null || groupReq.getDepartureAirport().trim().isEmpty()) {
                    throw new BusinessException("Departure airport is required for group", "INVALID_DEPARTURE_AIRPORT");
                }
                if (groupReq.getDestination() == null || groupReq.getDestination().trim().isEmpty()) {
                    throw new BusinessException("Destination is required for group", "INVALID_DESTINATION");
                }

                PricingGroup group = PricingGroup.builder()
                        .priceList(priceList)
                        .departureAirport(groupReq.getDepartureAirport().trim())
                        .destination(groupReq.getDestination().trim())
                        .build();

                if (groupReq.getEntries() != null) {
                    validateNoDuplicatePassengers(groupReq.getEntries());
                    for (PriceListDto.CreatePriceListEntryRequest entryReq : groupReq.getEntries()) {
                        if (entryReq.getPrice() != null && entryReq.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                            throw new BusinessException("Price cannot be negative", "INVALID_PRICE");
                        }
                        if (entryReq.getCommission() != null && entryReq.getCommission().compareTo(BigDecimal.ZERO) < 0) {
                            throw new BusinessException("Commission cannot be negative", "INVALID_COMMISSION");
                        }

                        PriceListEntry entry = PriceListEntry.builder()
                                .pricingGroup(group)
                                .passengerType(entryReq.getPassengerType())
                                .price(entryReq.getPrice() != null ? entryReq.getPrice() : BigDecimal.ZERO)
                                .commission(entryReq.getCommission() != null ? entryReq.getCommission() : BigDecimal.ZERO)
                                .currency(entryReq.getCurrency() != null ? entryReq.getCurrency() : "EGP")
                                .build();
                        group.getEntries().add(entry);
                    }
                }
                priceList.getGroups().add(group);
            }
        }

        return priceListMapper.toResponse(priceListRepository.save(priceList));
    }

    @Transactional
    public PriceListDto.PriceListResponse updatePriceList(UUID id, PriceListDto.UpdatePriceListRequest request) {
        PriceList priceList = priceListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PriceList", "id", id));

        if (request.getValidFrom() != null && request.getValidTo() != null && request.getValidFrom().isAfter(request.getValidTo())) {
             throw new BusinessException("Valid from date must be before or equal to valid to date", "INVALID_DATES");
        }

        priceList.setName(request.getName());
        priceList.setAgentId(request.getAgentId());
        priceList.setValidFrom(request.getValidFrom());
        priceList.setValidTo(request.getValidTo());
        
        if (request.getCommissionPercentage() != null) {
            priceList.setCommissionPercentage(request.getCommissionPercentage());
        }
        if (request.getMarkupAmount() != null) {
            priceList.setMarkupAmount(request.getMarkupAmount());
        }
        if (request.getStatus() != null) {
            priceList.setStatus(request.getStatus());
        }

        if (request.getGroups() != null) {
            priceList.getGroups().clear();
            for (PriceListDto.CreatePricingGroupRequest groupReq : request.getGroups()) {
                if (groupReq.getDepartureAirport() == null || groupReq.getDepartureAirport().trim().isEmpty()) {
                    throw new BusinessException("Departure airport is required for group", "INVALID_DEPARTURE_AIRPORT");
                }
                if (groupReq.getDestination() == null || groupReq.getDestination().trim().isEmpty()) {
                    throw new BusinessException("Destination is required for group", "INVALID_DESTINATION");
                }

                PricingGroup group = PricingGroup.builder()
                        .priceList(priceList)
                        .departureAirport(groupReq.getDepartureAirport().trim())
                        .destination(groupReq.getDestination().trim())
                        .build();

                if (groupReq.getEntries() != null) {
                    validateNoDuplicatePassengers(groupReq.getEntries());
                    for (PriceListDto.CreatePriceListEntryRequest entryReq : groupReq.getEntries()) {
                        if (entryReq.getPrice() != null && entryReq.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                            throw new BusinessException("Price cannot be negative", "INVALID_PRICE");
                        }
                        if (entryReq.getCommission() != null && entryReq.getCommission().compareTo(BigDecimal.ZERO) < 0) {
                            throw new BusinessException("Commission cannot be negative", "INVALID_COMMISSION");
                        }

                        PriceListEntry entry = PriceListEntry.builder()
                                .pricingGroup(group)
                                .passengerType(entryReq.getPassengerType())
                                .price(entryReq.getPrice() != null ? entryReq.getPrice() : BigDecimal.ZERO)
                                .commission(entryReq.getCommission() != null ? entryReq.getCommission() : BigDecimal.ZERO)
                                .currency(entryReq.getCurrency() != null ? entryReq.getCurrency() : "EGP")
                                .build();
                        group.getEntries().add(entry);
                    }
                }
                priceList.getGroups().add(group);
            }
        } else {
            priceList.getGroups().clear();
        }

        return priceListMapper.toResponse(priceListRepository.save(priceList));
    }

    @Transactional
    public void deletePriceList(UUID id) {
        if (!priceListRepository.existsById(id)) {
            throw new ResourceNotFoundException("PriceList", "id", id);
        }
        priceListRepository.deleteById(id);
    }

    private void validateNoDuplicatePassengers(List<PriceListDto.CreatePriceListEntryRequest> entries) {
        long uniqueTypes = entries.stream().map(PriceListDto.CreatePriceListEntryRequest::getPassengerType).distinct().count();
        if (uniqueTypes < entries.size()) {
            throw new BusinessException("Duplicate passenger type found in the same pricing group", "DUPLICATE_PASSENGER_TYPE");
        }
    }
}
