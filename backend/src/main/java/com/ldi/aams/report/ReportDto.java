package com.ldi.aams.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ReportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiMetric {
        @Builder.Default
        private BigDecimal current = BigDecimal.ZERO;
        @Builder.Default
        private BigDecimal previous = BigDecimal.ZERO;
        @Builder.Default
        private BigDecimal percentageChange = BigDecimal.ZERO;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiLongMetric {
        @Builder.Default
        private long current = 0;
        @Builder.Default
        private long previous = 0;
        @Builder.Default
        private BigDecimal percentageChange = BigDecimal.ZERO;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeChartPoint {
        private String date;
        private BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryChartPoint {
        private String name;
        private BigDecimal value;
        private BigDecimal percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailedSummaryRow {
        private int rowNum;
        private UUID agentId;
        private String agentName;
        private String destination;
        private long flights;
        private long passengers;
        private BigDecimal revenueEgp;
        private BigDecimal revenueUsd;
        private BigDecimal expensesEgp;
        private BigDecimal profitEgp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardResponse {
        private KpiMetric totalRevenueEgp;
        private KpiMetric totalRevenueUsd;
        private KpiMetric totalExpensesEgp;
        private KpiMetric netProfitEgp;
        private KpiLongMetric totalPassengers;
        private KpiLongMetric totalFlights;

        private List<TimeChartPoint> revenueOverTime;
        private List<CategoryChartPoint> revenueByDestination;
        private List<CategoryChartPoint> serviceTypeDistribution;
        private List<CategoryChartPoint> topAgentsByRevenue;

        private List<DetailedSummaryRow> detailedSummary;
    }
}
