package com.ldi.aams.airline;

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
@RequestMapping("/api/v1/airlines")
@RequiredArgsConstructor
public class AirlineController {

    private final AirlineService airlineService;

    @GetMapping
    @PreAuthorize("hasAuthority('AIRLINE_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<AirlineDto.AirlineResponse>>> getAllAirlines(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(airlineService.getAllAirlines(pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AIRLINE_VIEW')")
    public ResponseEntity<ApiResponse<AirlineDto.AirlineResponse>> getAirlineById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(airlineService.getAirlineById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('AIRLINE_CREATE')")
    public ResponseEntity<ApiResponse<AirlineDto.AirlineResponse>> createAirline(@Valid @RequestBody AirlineDto.CreateAirlineRequest request) {
        return new ResponseEntity<>(ApiResponse.success(airlineService.createAirline(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('AIRLINE_EDIT')")
    public ResponseEntity<ApiResponse<AirlineDto.AirlineResponse>> updateAirline(@PathVariable UUID id, @Valid @RequestBody AirlineDto.UpdateAirlineRequest request) {
        return ResponseEntity.ok(ApiResponse.success(airlineService.updateAirline(id, request)));
    }
}
