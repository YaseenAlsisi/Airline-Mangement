package com.ldi.aams.pricelist;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.common.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/price-lists")
@RequiredArgsConstructor
public class PriceListController {

    private final PriceListService priceListService;

    @GetMapping
    @PreAuthorize("hasAuthority('PRICE_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<PriceListDto.PriceListResponse>>> getAllPriceLists(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(priceListService.getAllPriceLists(pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRICE_VIEW')")
    public ResponseEntity<ApiResponse<PriceListDto.PriceListResponse>> getPriceListById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(priceListService.getPriceListById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRICE_CREATE')")
    public ResponseEntity<ApiResponse<PriceListDto.PriceListResponse>> createPriceList(@Valid @RequestBody PriceListDto.CreatePriceListRequest request) {
        return new ResponseEntity<>(ApiResponse.success(priceListService.createPriceList(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRICE_EDIT')")
    public ResponseEntity<ApiResponse<PriceListDto.PriceListResponse>> updatePriceList(@PathVariable UUID id, @Valid @RequestBody PriceListDto.UpdatePriceListRequest request) {
        return ResponseEntity.ok(ApiResponse.success(priceListService.updatePriceList(id, request)));
    }
}
