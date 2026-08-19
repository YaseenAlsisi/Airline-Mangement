package com.ldi.aams.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<DashboardDto.DashboardOverviewResponse> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String agent,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String serviceType) {
        
        DashboardDto.DashboardOverviewResponse response = dashboardService.getDashboardOverview(startDate, endDate, agent, destination, serviceType);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter-options")
    public ResponseEntity<DashboardDto.FilterOptionsResponse> getFilterOptions() {
        DashboardDto.FilterOptionsResponse response = dashboardService.getFilterOptions();
        return ResponseEntity.ok(response);
    }
}
