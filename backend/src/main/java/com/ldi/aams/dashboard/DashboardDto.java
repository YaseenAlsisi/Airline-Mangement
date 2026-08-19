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
        private String flightNumber;
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
    public static class BatchItem {
        private String fileName;
        private String status;
        private Long totalRows;
        private Long validRows;
        private Long invalidRows;
        private String publishedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentBalanceItem {
        private String agentName;
        private BigDecimal totalDebit;
        private BigDecimal totalPaid;
        private BigDecimal remainingBalance;
        private String lastPaymentDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataIssueItem {
        private String issueType;
        private Long count;
        private String severity; // WARNING or ERROR
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Kpis {
        private Long totalPassengers;
        private Double passengersChange;

        private Long totalFlights;
        private Double flightsChange;

        private BigDecimal revenueEgp;
        private Double revenueChange;

        private BigDecimal revenueUsd;
        private BigDecimal expensesEgp;
        private BigDecimal netProfitEgp;
        private Double profitChange;

        private Long publishedFiles;
        private Long dataIssues;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Charts {
        private List<ChartItem> revenueOverTime;
        private List<ChartItem> profitOverTime;
        private List<ChartItem> revenueByDestination;
        private List<ChartItem> revenueByServiceType;
        private List<ChartItem> passengersByDestination;
        private List<ChartItem> passengersByServiceType;
        private List<ChartItem> passengersByCategory;
        private List<ChartItem> topAgentsByPassengers;
        private List<ChartItem> topAgentsByRevenue;
        private List<ChartItem> flightsByDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterOptionsResponse {
        private List<String> agents;
        private List<String> destinations;
        private List<String> serviceTypes;
        private List<String> passengerCategories;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardOverviewResponse {
        private Kpis kpis;
        private Charts charts;
        private List<FlightItem> flights;
        private List<BatchItem> latestBatches;
        private List<AgentBalanceItem> agentBalances;
        private List<DataIssueItem> dataHealth;
        private FilterOptionsResponse filterOptions;
        private String currency; // EGP
    }
}
