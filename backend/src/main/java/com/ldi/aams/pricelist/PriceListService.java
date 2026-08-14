package com.ldi.aams.pricelist;

import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import com.ldi.aams.pricelist.internal.PriceList;
import com.ldi.aams.pricelist.internal.PriceListMapper;
import com.ldi.aams.pricelist.internal.PriceListRepository;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class PriceListService {

    private final PriceListRepository priceListRepository;
    private final PriceListMapper priceListMapper;

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

        // Sort by specificity:
        // Score: agent matches = 2, airline matches = 1. Highest score wins.
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
                .airlineId(request.getAirlineId())
                .agentId(request.getAgentId())
                .commissionPercentage(request.getCommissionPercentage() != null ? request.getCommissionPercentage() : BigDecimal.ZERO)
                .markupAmount(request.getMarkupAmount() != null ? request.getMarkupAmount() : BigDecimal.ZERO)
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .build();

        if (request.getEntries() != null) {
            priceList.getEntries().addAll(request.getEntries().stream().map(e -> 
                com.ldi.aams.pricelist.internal.PriceListEntry.builder()
                    .priceList(priceList)
                    .departure(e.getDeparture())
                    .destination(e.getDestination())
                    .passengerType(e.getPassengerType())
                    .price(e.getPrice() != null ? e.getPrice() : BigDecimal.ZERO)
                    .commission(e.getCommission() != null ? e.getCommission() : BigDecimal.ZERO)
                    .currency(e.getCurrency() != null ? e.getCurrency() : "EGP")
                    .build()
            ).toList());
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
        priceList.setAirlineId(request.getAirlineId());
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

        if (request.getEntries() != null) {
            priceList.getEntries().clear();
            priceList.getEntries().addAll(request.getEntries().stream().map(e -> 
                com.ldi.aams.pricelist.internal.PriceListEntry.builder()
                    .priceList(priceList)
                    .departure(e.getDeparture())
                    .destination(e.getDestination())
                    .passengerType(e.getPassengerType())
                    .price(e.getPrice() != null ? e.getPrice() : BigDecimal.ZERO)
                    .commission(e.getCommission() != null ? e.getCommission() : BigDecimal.ZERO)
                    .currency(e.getCurrency() != null ? e.getCurrency() : "EGP")
                    .build()
            ).toList());
        }

        return priceListMapper.toResponse(priceListRepository.save(priceList));
    }
}
