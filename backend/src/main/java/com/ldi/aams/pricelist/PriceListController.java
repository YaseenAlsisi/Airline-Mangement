package com.ldi.aams.pricelist;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.common.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/price-lists")
public class PriceListController {

    private final PriceListService priceListService;
    private final JdbcTemplate jdbcTemplate;

    public PriceListController(PriceListService priceListService, JdbcTemplate jdbcTemplate) {
        this.priceListService = priceListService;
        this.jdbcTemplate = jdbcTemplate;
    }

    private void fixPoisonPills() {
        // Fix Arabic values
        jdbcTemplate.update("UPDATE price_list_entries SET passenger_type = 'ADULT' WHERE passenger_type IN ('\u0628\u0627\u0644\u063a', 'Adult', 'adult', 'ADULTS')");
        jdbcTemplate.update("UPDATE price_list_entries SET passenger_type = 'LADIES' WHERE passenger_type IN ('\u0633\u064a\u062f\u0627\u062a', 'Ladies', 'ladies', 'LADY')");
        jdbcTemplate.update("UPDATE price_list_entries SET passenger_type = 'INFANT' WHERE passenger_type IN ('\u0631\u0636\u064a\u0639', 'Infant', 'infant', 'INFANTS')");
        jdbcTemplate.update("UPDATE price_list_entries SET passenger_type = 'CHILD' WHERE passenger_type IN ('\u0637\u0641\u0644', 'Child', 'child', 'CHILD')");
        jdbcTemplate.update("UPDATE price_list_entries SET passenger_type = 'CHILD_UNDER_8' WHERE passenger_type IN ('Child_Under_8', 'CHILD_UNDER8')");
        // Fix anything else that doesn't match the valid enum values
        jdbcTemplate.update("UPDATE price_list_entries SET passenger_type = 'ADULT' WHERE passenger_type NOT IN ('ADULT', 'CHILD', 'CHILD_UNDER_8', 'LADIES', 'INFANT')");
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PRICE_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<PriceListDto.PriceListResponse>>> getAllPriceLists(Pageable pageable) {
        fixPoisonPills();
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRICE_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deletePriceList(@PathVariable UUID id) {
        priceListService.deletePriceList(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
