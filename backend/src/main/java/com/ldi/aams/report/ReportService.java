package com.ldi.aams.report;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public ReportDto.DashboardResponse getDashboardData(
            LocalDate startDate, LocalDate endDate,
            UUID agentId, String destination, String serviceType) {
        
        // Base where clause
        StringBuilder baseWhere = new StringBuilder("WHERE validation_status = 'VALID' AND batch_id IN (SELECT id FROM manifest_import_batches WHERE status = 'PUBLISHED') ");
        List<Object> currentParams = new ArrayList<>();
        
        if (startDate != null) {
            baseWhere.append(" AND departure_date >= ? ");
            currentParams.add(startDate);
        }
        if (endDate != null) {
            baseWhere.append(" AND departure_date <= ? ");
            currentParams.add(endDate);
        }
        if (agentId != null) {
            baseWhere.append(" AND agent_id = ? ");
            currentParams.add(agentId);
        }
        if (destination != null && !destination.isEmpty()) {
            baseWhere.append(" AND destination = ? ");
            currentParams.add(destination);
        }
        if (serviceType != null && !serviceType.isEmpty()) {
            baseWhere.append(" AND service_type = ? ");
            currentParams.add(serviceType);
        }

        // Previous Period logic
        StringBuilder prevWhere = new StringBuilder("WHERE validation_status = 'VALID' AND batch_id IN (SELECT id FROM manifest_import_batches WHERE status = 'PUBLISHED') ");
        List<Object> prevParams = new ArrayList<>();
        
        if (startDate != null && endDate != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
            LocalDate prevStart = startDate.minusDays(days);
            LocalDate prevEnd = endDate.minusDays(days);
            prevWhere.append(" AND departure_date >= ? AND departure_date <= ? ");
            prevParams.add(prevStart);
            prevParams.add(prevEnd);
        } else {
            prevWhere.append(" AND 1=0 "); // no prev period
        }
        if (agentId != null) {
            prevWhere.append(" AND agent_id = ? ");
            prevParams.add(agentId);
        }
        if (destination != null && !destination.isEmpty()) {
            prevWhere.append(" AND destination = ? ");
            prevParams.add(destination);
        }
        if (serviceType != null && !serviceType.isEmpty()) {
            prevWhere.append(" AND service_type = ? ");
            prevParams.add(serviceType);
        }

        // 1. KPI Metrics
        String kpiQuery = "SELECT " +
                "COALESCE(SUM(total_price), 0) as revenueEgp, " +
                "COALESCE(SUM(debit_usd), 0) as revenueUsd, " +
                "COALESCE(SUM(commission), 0) as expensesEgp, " +
                "COUNT(*) as totalPassengers, " +
                "COUNT(DISTINCT flight_number) as totalFlights " +
                "FROM manifest_passengers " + baseWhere.toString();
        
        Map<String, Object> currentKpi = fetchKpis(kpiQuery, currentParams);

        String prevKpiQuery = "SELECT " +
                "COALESCE(SUM(total_price), 0) as revenueEgp, " +
                "COALESCE(SUM(debit_usd), 0) as revenueUsd, " +
                "COALESCE(SUM(commission), 0) as expensesEgp, " +
                "COUNT(*) as totalPassengers, " +
                "COUNT(DISTINCT flight_number) as totalFlights " +
                "FROM manifest_passengers " + prevWhere.toString();
        
        Map<String, Object> prevKpi = fetchKpis(prevKpiQuery, prevParams);

        // Process KPIs
        ReportDto.KpiMetric revEgp = buildKpiMetric((BigDecimal) currentKpi.get("revenueEgp"), (BigDecimal) prevKpi.get("revenueEgp"));
        ReportDto.KpiMetric revUsd = buildKpiMetric((BigDecimal) currentKpi.get("revenueUsd"), (BigDecimal) prevKpi.get("revenueUsd"));
        ReportDto.KpiMetric expEgp = buildKpiMetric((BigDecimal) currentKpi.get("expensesEgp"), (BigDecimal) prevKpi.get("expensesEgp"));
        
        BigDecimal currentProfit = ((BigDecimal) currentKpi.get("revenueEgp")).subtract((BigDecimal) currentKpi.get("expensesEgp"));
        BigDecimal prevProfit = ((BigDecimal) prevKpi.get("revenueEgp")).subtract((BigDecimal) prevKpi.get("expensesEgp"));
        ReportDto.KpiMetric profitEgp = buildKpiMetric(currentProfit, prevProfit);

        ReportDto.KpiLongMetric passCount = buildKpiLongMetric((Long) currentKpi.get("totalPassengers"), (Long) prevKpi.get("totalPassengers"));
        ReportDto.KpiLongMetric flightCount = buildKpiLongMetric((Long) currentKpi.get("totalFlights"), (Long) prevKpi.get("totalFlights"));

        // 2. Revenue Over Time
        String timeQuery = "SELECT TO_CHAR(departure_date, 'DD Mon') as dateStr, COALESCE(SUM(total_price), 0) as total " +
                "FROM manifest_passengers " + baseWhere.toString() + " AND departure_date IS NOT NULL " +
                "GROUP BY departure_date ORDER BY departure_date";
        List<ReportDto.TimeChartPoint> timeChart = jdbcTemplate.query(timeQuery, (rs, rowNum) -> new ReportDto.TimeChartPoint(rs.getString("dateStr"), rs.getBigDecimal("total")), currentParams.toArray());

        // 3. Revenue By Destination
        String destQuery = "SELECT COALESCE(destination, 'Unknown') as name, COALESCE(SUM(total_price), 0) as total " +
                "FROM manifest_passengers " + baseWhere.toString() + " GROUP BY destination ORDER BY total DESC LIMIT 10";
        List<ReportDto.CategoryChartPoint> destChart = jdbcTemplate.query(destQuery, (rs, rowNum) -> new ReportDto.CategoryChartPoint(rs.getString("name"), rs.getBigDecimal("total"), null), currentParams.toArray());

        // 4. Service Type Distribution
        String srvQuery = "SELECT COALESCE(service_type, 'Other') as name, COUNT(*) as cnt " +
                "FROM manifest_passengers " + baseWhere.toString() + " GROUP BY service_type";
        long totalValidPass = (Long) currentKpi.get("totalPassengers");
        List<ReportDto.CategoryChartPoint> srvChart = jdbcTemplate.query(srvQuery, (rs, rowNum) -> {
            BigDecimal cnt = rs.getBigDecimal("cnt");
            BigDecimal pct = totalValidPass > 0 ? cnt.multiply(new BigDecimal(100)).divide(new BigDecimal(totalValidPass), 1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            return new ReportDto.CategoryChartPoint(rs.getString("name"), cnt, pct);
        }, currentParams.toArray());

        // 5. Top 5 Agents
        String agentQuery = "SELECT COALESCE(a.name, mp.agent_name_raw, 'Direct') as name, COALESCE(SUM(mp.total_price), 0) as total " +
                "FROM manifest_passengers mp LEFT JOIN agents a ON mp.agent_id = a.id " +
                baseWhere.toString() + " GROUP BY a.name, mp.agent_name_raw ORDER BY total DESC";
        List<ReportDto.CategoryChartPoint> agentChart = jdbcTemplate.query(agentQuery, (rs, rowNum) -> new ReportDto.CategoryChartPoint(rs.getString("name"), rs.getBigDecimal("total"), null), currentParams.toArray());

        // 6. Detailed Summary Table
        String tableQuery = "SELECT a.id as agentId, COALESCE(a.name, mp.agent_name_raw, 'Direct') as agentName, " +
                "COALESCE(mp.destination, 'Unknown') as dest, " +
                "COUNT(DISTINCT mp.flight_number) as flt, " +
                "COUNT(*) as pass, " +
                "COALESCE(SUM(mp.total_price), 0) as revEgp, " +
                "COALESCE(SUM(mp.debit_usd), 0) as revUsd, " +
                "COALESCE(SUM(mp.commission), 0) as expEgp " +
                "FROM manifest_passengers mp LEFT JOIN agents a ON mp.agent_id = a.id " +
                baseWhere.toString() + " GROUP BY a.id, a.name, mp.agent_name_raw, mp.destination ORDER BY revEgp DESC LIMIT 100";
        
        List<ReportDto.DetailedSummaryRow> table = jdbcTemplate.query(tableQuery, (rs, rowNum) -> {
            BigDecimal revE = rs.getBigDecimal("revEgp");
            BigDecimal expE = rs.getBigDecimal("expEgp");
            return ReportDto.DetailedSummaryRow.builder()
                    .rowNum(rowNum + 1)
                    .agentId(rs.getObject("agentId", UUID.class))
                    .agentName(rs.getString("agentName"))
                    .destination(rs.getString("dest"))
                    .flights(rs.getLong("flt"))
                    .passengers(rs.getLong("pass"))
                    .revenueEgp(revE)
                    .revenueUsd(rs.getBigDecimal("revUsd"))
                    .expensesEgp(expE)
                    .profitEgp(revE.subtract(expE))
                    .build();
        }, currentParams.toArray());

        return ReportDto.DashboardResponse.builder()
                .totalRevenueEgp(revEgp)
                .totalRevenueUsd(revUsd)
                .totalExpensesEgp(expEgp)
                .netProfitEgp(profitEgp)
                .totalPassengers(passCount)
                .totalFlights(flightCount)
                .revenueOverTime(timeChart)
                .revenueByDestination(destChart)
                .serviceTypeDistribution(srvChart)
                .topAgentsByRevenue(agentChart)
                .detailedSummary(table)
                .build();
    }
    
    private Map<String, Object> fetchKpis(String query, List<Object> params) {
        return jdbcTemplate.queryForObject(query, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("revenueEgp", rs.getBigDecimal("revenueEgp"));
            map.put("revenueUsd", rs.getBigDecimal("revenueUsd"));
            map.put("expensesEgp", rs.getBigDecimal("expensesEgp"));
            map.put("totalPassengers", rs.getLong("totalPassengers"));
            map.put("totalFlights", rs.getLong("totalFlights"));
            return map;
        }, params.toArray());
    }

    private ReportDto.KpiMetric buildKpiMetric(BigDecimal curr, BigDecimal prev) {
        if (curr == null) curr = BigDecimal.ZERO;
        if (prev == null) prev = BigDecimal.ZERO;
        BigDecimal change = BigDecimal.ZERO;
        if (prev.compareTo(BigDecimal.ZERO) != 0) {
            change = curr.subtract(prev).divide(prev, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100));
        } else if (curr.compareTo(BigDecimal.ZERO) > 0) {
            change = new BigDecimal(100);
        }
        return new ReportDto.KpiMetric(curr, prev, change);
    }

    private ReportDto.KpiLongMetric buildKpiLongMetric(Long curr, Long prev) {
        if (curr == null) curr = 0L;
        if (prev == null) prev = 0L;
        BigDecimal change = BigDecimal.ZERO;
        if (prev != 0) {
            change = new BigDecimal(curr - prev).divide(new BigDecimal(prev), 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100));
        } else if (curr > 0) {
            change = new BigDecimal(100);
        }
        return new ReportDto.KpiLongMetric(curr, prev, change);
    }
}
