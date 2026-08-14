package com.ldi.aams.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class ReportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesSummaryResponse {
        private long totalTickets;
        
        @Builder.Default
        private BigDecimal totalBaseFares = BigDecimal.ZERO;
        
        @Builder.Default
        private BigDecimal totalTaxes = BigDecimal.ZERO;
        
        @Builder.Default
        private BigDecimal totalGrossSales = BigDecimal.ZERO;
        
        @Builder.Default
        private BigDecimal totalAgentCommissions = BigDecimal.ZERO;
        
        @Builder.Default
        private BigDecimal totalNetPayable = BigDecimal.ZERO;
    }
}
