package com.ldi.aams.dashboard;

import com.ldi.aams.manifest.internal.ManifestPassenger;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public DashboardDto.DashboardOverviewResponse getDashboardOverview(LocalDate startDate, LocalDate endDate, String agent, String destination, String serviceType) {
        
        String whereClause = " WHERE p.batch.status = 'PUBLISHED' ";
        if (startDate != null) whereClause += " AND p.departureDate >= :startDate ";
        if (endDate != null) whereClause += " AND p.departureDate <= :endDate ";
        if (agent != null && !agent.trim().isEmpty()) whereClause += " AND p.agentNameRaw = :agent ";
        if (destination != null && !destination.trim().isEmpty()) whereClause += " AND p.destination = :destination ";
        if (serviceType != null && !serviceType.trim().isEmpty()) whereClause += " AND p.serviceType = :serviceType ";

        // Previous Period Calculation
        String prevWhereClause = " WHERE p.batch.status = 'PUBLISHED' ";
        LocalDate prevStartDate = null;
        LocalDate prevEndDate = null;
        if (startDate != null && endDate != null) {
            long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
            prevEndDate = startDate.minusDays(1);
            prevStartDate = prevEndDate.minusDays(daysBetween);
            prevWhereClause += " AND p.departureDate >= :prevStartDate AND p.departureDate <= :prevEndDate ";
        } else if (startDate != null) { // only start date
            prevEndDate = startDate.minusDays(1);
            prevWhereClause += " AND p.departureDate <= :prevEndDate ";
        } else if (endDate != null) { // only end date
            // Can't really define previous period if only end date is given, but let's just use same filters
            prevWhereClause += " AND p.departureDate <= :endDate ";
        }
        
        if (agent != null && !agent.trim().isEmpty()) prevWhereClause += " AND p.agentNameRaw = :agent ";
        if (destination != null && !destination.trim().isEmpty()) prevWhereClause += " AND p.destination = :destination ";
        if (serviceType != null && !serviceType.trim().isEmpty()) prevWhereClause += " AND p.serviceType = :serviceType ";

        // 1. KPIs
        long totalPassengers = getSingleLongResult("SELECT COUNT(p) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination, serviceType);
        long prevTotalPassengers = getSingleLongResult("SELECT COUNT(p) FROM ManifestPassenger p " + prevWhereClause, prevStartDate, prevEndDate, agent, destination, serviceType);
        
        long totalFlights = getSingleLongResult("SELECT COUNT(DISTINCT p.flightNumber) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination, serviceType);
        long prevTotalFlights = getSingleLongResult("SELECT COUNT(DISTINCT p.flightNumber) FROM ManifestPassenger p " + prevWhereClause, prevStartDate, prevEndDate, agent, destination, serviceType);
        
        BigDecimal revenueEgp = getSingleBigDecimalResult("SELECT SUM(p.totalPrice) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination, serviceType);
        BigDecimal prevRevenueEgp = getSingleBigDecimalResult("SELECT SUM(p.totalPrice) FROM ManifestPassenger p " + prevWhereClause, prevStartDate, prevEndDate, agent, destination, serviceType);
        
        BigDecimal revenueUsd = getSingleBigDecimalResult("SELECT SUM(p.debitUsd) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination, serviceType);
        BigDecimal expensesEgp = getSingleBigDecimalResult("SELECT SUM(p.commission) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination, serviceType);
        
        BigDecimal netProfitEgp = revenueEgp.subtract(expensesEgp);
        BigDecimal prevExpensesEgp = getSingleBigDecimalResult("SELECT SUM(p.commission) FROM ManifestPassenger p " + prevWhereClause, prevStartDate, prevEndDate, agent, destination, serviceType);
        BigDecimal prevNetProfitEgp = prevRevenueEgp.subtract(prevExpensesEgp);
        
        long publishedFiles = getSingleLongResult("SELECT COUNT(DISTINCT p.batch.id) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination, serviceType);
        
        long invalidRows = getSingleLongResult("SELECT COUNT(p) FROM ManifestPassenger p WHERE p.validationStatus != 'VALID'", null, null, null, null, null);

        DashboardDto.Kpis kpis = DashboardDto.Kpis.builder()
                .totalPassengers(totalPassengers)
                .passengersChange(calculatePercentChange(totalPassengers, prevTotalPassengers))
                .totalFlights(totalFlights)
                .flightsChange(calculatePercentChange(totalFlights, prevTotalFlights))
                .revenueEgp(revenueEgp)
                .revenueChange(calculatePercentChange(revenueEgp.doubleValue(), prevRevenueEgp.doubleValue()))
                .revenueUsd(revenueUsd)
                .expensesEgp(expensesEgp)
                .netProfitEgp(netProfitEgp)
                .profitChange(calculatePercentChange(netProfitEgp.doubleValue(), prevNetProfitEgp.doubleValue()))
                .publishedFiles(publishedFiles)
                .dataIssues(invalidRows)
                .build();

        // 2. Charts
        DashboardDto.Charts charts = DashboardDto.Charts.builder()
                .revenueByDestination(getChartData("SELECT p.destination, SUM(p.totalPrice) FROM ManifestPassenger p " + whereClause + " GROUP BY p.destination ORDER BY SUM(p.totalPrice) DESC", startDate, endDate, agent, destination, serviceType, revenueEgp.longValue()))
                .revenueByServiceType(getChartData("SELECT p.serviceType, SUM(p.totalPrice) FROM ManifestPassenger p " + whereClause + " GROUP BY p.serviceType ORDER BY SUM(p.totalPrice) DESC", startDate, endDate, agent, destination, serviceType, revenueEgp.longValue()))
                .passengersByDestination(getChartData("SELECT p.destination, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.destination ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, serviceType, totalPassengers))
                .passengersByServiceType(getChartData("SELECT p.serviceType, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.serviceType ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, serviceType, totalPassengers))
                .passengersByCategory(getChartData("SELECT p.passengerCategory, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.passengerCategory ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, serviceType, totalPassengers))
                .topAgentsByPassengers(getChartData("SELECT p.agentNameRaw, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.agentNameRaw ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, serviceType, totalPassengers))
                .topAgentsByRevenue(getChartData("SELECT p.agentNameRaw, SUM(p.totalPrice) FROM ManifestPassenger p " + whereClause + " GROUP BY p.agentNameRaw ORDER BY SUM(p.totalPrice) DESC", startDate, endDate, agent, destination, serviceType, revenueEgp.longValue()))
                .flightsByDate(getChartData("SELECT p.departureDate, COUNT(DISTINCT p.flightNumber) FROM ManifestPassenger p " + whereClause + " GROUP BY p.departureDate ORDER BY p.departureDate ASC", startDate, endDate, agent, destination, serviceType, totalFlights))
                .revenueOverTime(getChartData("SELECT p.departureDate, SUM(p.totalPrice) FROM ManifestPassenger p " + whereClause + " GROUP BY p.departureDate ORDER BY p.departureDate ASC", startDate, endDate, agent, destination, serviceType, revenueEgp.longValue()))
                .profitOverTime(getChartData("SELECT p.departureDate, SUM(p.totalPrice) - SUM(p.commission) FROM ManifestPassenger p " + whereClause + " GROUP BY p.departureDate ORDER BY p.departureDate ASC", startDate, endDate, agent, destination, serviceType, netProfitEgp.longValue()))
                .build();

        // 3. Flights
        String todaysFlightsQueryStr = "SELECT p.departureDate, p.arrivalTime, p.departurePort, p.destination, p.flightNumber, COUNT(p), p.serviceType FROM ManifestPassenger p " + 
                                       whereClause +
                                       " GROUP BY p.departureDate, p.arrivalTime, p.departurePort, p.destination, p.flightNumber, p.serviceType ORDER BY p.departureDate DESC, p.arrivalTime ASC";
        Query tfQuery = entityManager.createQuery(todaysFlightsQueryStr);
        setParams(tfQuery, startDate, endDate, agent, destination, serviceType);
        tfQuery.setMaxResults(10);
        List<Object[]> tfResults = tfQuery.getResultList();
        
        List<DashboardDto.FlightItem> flights = new ArrayList<>();
        for (Object[] row : tfResults) {
            String depDate = row[0] != null ? row[0].toString() : "";
            String arrTime = row[1] != null ? row[1].toString() : "";
            flights.add(DashboardDto.FlightItem.builder()
                    .time(depDate + " " + arrTime)
                    .from(row[2] != null ? row[2].toString() : "Unknown")
                    .to(row[3] != null ? row[3].toString() : "Unknown")
                    .flightNumber(row[4] != null ? row[4].toString() : "Unknown")
                    .passengers(((Number) row[5]).longValue())
                    .type(row[6] != null ? row[6].toString() : "Unknown")
                    .build());
        }

        // 4. Latest Batches
        Query batchQuery = entityManager.createQuery("SELECT b.originalFilename, b.status, b.totalRows, b.validRows, b.invalidRows, b.publishedAt FROM ManifestImportBatch b ORDER BY b.createdAt DESC");
        batchQuery.setMaxResults(5);
        List<Object[]> batchResults = batchQuery.getResultList();
        List<DashboardDto.BatchItem> latestBatches = new ArrayList<>();
        for (Object[] row : batchResults) {
            latestBatches.add(DashboardDto.BatchItem.builder()
                    .fileName(row[0] != null ? row[0].toString() : "")
                    .status(row[1] != null ? row[1].toString() : "")
                    .totalRows(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                    .validRows(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                    .invalidRows(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                    .publishedAt(row[5] != null ? row[5].toString() : "")
                    .build());
        }

        // 5. Data Health
        List<DashboardDto.DataIssueItem> dataHealth = new ArrayList<>();
        long missingPrice = getSingleLongResult("SELECT COUNT(p) FROM ManifestPassenger p WHERE p.totalPrice IS NULL", null, null, null, null, null);
        long missingAgent = getSingleLongResult("SELECT COUNT(p) FROM ManifestPassenger p WHERE p.agentNameRaw IS NULL OR TRIM(p.agentNameRaw) = ''", null, null, null, null, null);
        
        if (invalidRows > 0) dataHealth.add(new DashboardDto.DataIssueItem("Invalid Rows (Errors/Warnings)", invalidRows, "ERROR"));
        if (missingPrice > 0) dataHealth.add(new DashboardDto.DataIssueItem("Missing Price", missingPrice, "WARNING"));
        if (missingAgent > 0) dataHealth.add(new DashboardDto.DataIssueItem("Missing Agent", missingAgent, "WARNING"));

        // 6. Agent Balances (Top 5 owing)
        List<Object[]> debitResults = entityManager.createQuery("SELECT p.agentNameRaw, SUM(p.totalPrice) FROM ManifestPassenger p GROUP BY p.agentNameRaw").getResultList();
        List<Object[]> creditResults = entityManager.createQuery("SELECT p.agentNameRaw, SUM(p.amount), MAX(p.paymentDate) FROM AgentPayment p GROUP BY p.agentNameRaw").getResultList();
        
        java.util.Map<String, DashboardDto.AgentBalanceItem> balanceMap = new java.util.HashMap<>();
        for (Object[] row : debitResults) {
            String agentName = row[0] != null ? row[0].toString() : "Unknown";
            if (agentName.trim().isEmpty()) continue;
            BigDecimal debit = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            balanceMap.put(agentName, DashboardDto.AgentBalanceItem.builder().agentName(agentName).totalDebit(debit).totalPaid(BigDecimal.ZERO).remainingBalance(debit).lastPaymentDate("").build());
        }
        for (Object[] row : creditResults) {
            String agentName = row[0] != null ? row[0].toString() : "Unknown";
            if (agentName.trim().isEmpty()) continue;
            BigDecimal credit = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            String lastDate = row[2] != null ? row[2].toString() : "";
            DashboardDto.AgentBalanceItem item = balanceMap.getOrDefault(agentName, DashboardDto.AgentBalanceItem.builder().agentName(agentName).totalDebit(BigDecimal.ZERO).build());
            item.setTotalPaid(credit);
            item.setRemainingBalance(item.getTotalDebit().subtract(credit));
            item.setLastPaymentDate(lastDate);
            balanceMap.put(agentName, item);
        }
        
        List<DashboardDto.AgentBalanceItem> agentBalances = new ArrayList<>(balanceMap.values());
        agentBalances.sort((a, b) -> b.getRemainingBalance().compareTo(a.getRemainingBalance()));
        if (agentBalances.size() > 5) agentBalances = agentBalances.subList(0, 5);

        return DashboardDto.DashboardOverviewResponse.builder()
                .kpis(kpis)
                .charts(charts)
                .flights(flights)
                .latestBatches(latestBatches)
                .agentBalances(agentBalances)
                .dataHealth(dataHealth)
                .currency("EGP")
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardDto.FilterOptionsResponse getFilterOptions() {
        List<String> agents = entityManager.createQuery("SELECT DISTINCT p.agentNameRaw FROM ManifestPassenger p WHERE p.agentNameRaw IS NOT NULL AND p.agentNameRaw != '' ORDER BY p.agentNameRaw", String.class).getResultList();
        List<String> destinations = entityManager.createQuery("SELECT DISTINCT p.destination FROM ManifestPassenger p WHERE p.destination IS NOT NULL AND p.destination != '' ORDER BY p.destination", String.class).getResultList();
        List<String> serviceTypes = entityManager.createQuery("SELECT DISTINCT p.serviceType FROM ManifestPassenger p WHERE p.serviceType IS NOT NULL AND p.serviceType != '' ORDER BY p.serviceType", String.class).getResultList();
        List<String> passengerCategories = entityManager.createQuery("SELECT DISTINCT p.passengerCategory FROM ManifestPassenger p WHERE p.passengerCategory IS NOT NULL AND p.passengerCategory != '' ORDER BY p.passengerCategory", String.class).getResultList();

        return DashboardDto.FilterOptionsResponse.builder()
                .agents(agents)
                .destinations(destinations)
                .serviceTypes(serviceTypes)
                .passengerCategories(passengerCategories)
                .build();
    }

    private void setParams(Query query, LocalDate startDate, LocalDate endDate, String agent, String destination, String serviceType) {
        if (startDate != null) query.setParameter("startDate", startDate);
        if (endDate != null) query.setParameter("endDate", endDate);
        if (agent != null && !agent.trim().isEmpty()) query.setParameter("agent", agent);
        if (destination != null && !destination.trim().isEmpty()) query.setParameter("destination", destination);
        if (serviceType != null && !serviceType.trim().isEmpty()) query.setParameter("serviceType", serviceType);
    }
    
    private void setPrevParams(Query query, LocalDate prevStartDate, LocalDate prevEndDate, String agent, String destination, String serviceType) {
        if (prevStartDate != null) query.setParameter("prevStartDate", prevStartDate);
        if (prevEndDate != null) query.setParameter("prevEndDate", prevEndDate);
        if (agent != null && !agent.trim().isEmpty()) query.setParameter("agent", agent);
        if (destination != null && !destination.trim().isEmpty()) query.setParameter("destination", destination);
        if (serviceType != null && !serviceType.trim().isEmpty()) query.setParameter("serviceType", serviceType);
    }

    private Double calculatePercentChange(double current, double prev) {
        if (prev == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - prev) / prev) * 100.0;
    }

    private long getSingleLongResult(String jpql, LocalDate startDate, LocalDate endDate, String agent, String destination, String serviceType) {
        Query query = entityManager.createQuery(jpql);
        
        if (jpql.contains("prevStartDate")) {
            setPrevParams(query, startDate, endDate, agent, destination, serviceType);
        } else {
            setParams(query, startDate, endDate, agent, destination, serviceType);
        }
        
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).longValue() : 0L;
    }

    private BigDecimal getSingleBigDecimalResult(String jpql, LocalDate startDate, LocalDate endDate, String agent, String destination, String serviceType) {
        Query query = entityManager.createQuery(jpql);
        
        if (jpql.contains("prevStartDate")) {
            setPrevParams(query, startDate, endDate, agent, destination, serviceType);
        } else {
            setParams(query, startDate, endDate, agent, destination, serviceType);
        }
        
        Object result = query.getSingleResult();
        return result != null ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
    }

    private List<DashboardDto.ChartItem> getChartData(String jpql, LocalDate startDate, LocalDate endDate, String agent, String destination, String serviceType, long totalForPercent) {
        Query query = entityManager.createQuery(jpql);
        setParams(query, startDate, endDate, agent, destination, serviceType);
        
        List<Object[]> results = query.getResultList();
        List<DashboardDto.ChartItem> items = new ArrayList<>();
        
        for (Object[] row : results) {
            String name = row[0] != null ? row[0].toString() : "Unknown";
            Number value = row[1] != null ? (Number) row[1] : 0;
            Double percent = 0.0;
            if (totalForPercent > 0) {
                percent = Math.round((value.doubleValue() / totalForPercent * 100.0) * 10.0) / 10.0;
            }
            items.add(DashboardDto.ChartItem.builder()
                    .name(name)
                    .value(value)
                    .percent(percent)
                    .build());
        }
        return items;
    }
}
