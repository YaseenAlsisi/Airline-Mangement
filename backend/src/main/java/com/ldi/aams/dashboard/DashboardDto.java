package com.ldi.aams.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartItem {
        private String name;
        private Number value;
        private Double percent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightItem {
        private String time;
        private String from;
        private String to;
        private Long passengers;
        private String type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummaryResponse {
        private long totalPassengers;
        private long totalFlights;
        private long totalAgents;
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal netProfit;
        private Double profitMargin;
        private String currency;

        private List<ChartItem> passengersByDestination;
        private List<ChartItem> revenueByServiceType;
        private List<ChartItem> passengersByAirline;
        private List<ChartItem> passengersByCategory;
        private List<ChartItem> topAgents;
        
        private List<FlightItem> todaysFlights;
    }
}
