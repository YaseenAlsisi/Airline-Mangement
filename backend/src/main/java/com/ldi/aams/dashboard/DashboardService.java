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

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public DashboardDto.DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate, String agent, String destination) {
        // Base WHERE clause
        String whereClause = " WHERE p.batch.status = 'PUBLISHED' ";
        if (startDate != null) {
            whereClause += " AND p.departureDate >= :startDate ";
        }
        if (endDate != null) {
            whereClause += " AND p.departureDate <= :endDate ";
        }
        if (agent != null && !agent.trim().isEmpty()) {
            whereClause += " AND p.agentNameRaw = :agent ";
        }
        if (destination != null && !destination.trim().isEmpty()) {
            whereClause += " AND p.destination = :destination ";
        }

        long totalPassengers = getSingleLongResult("SELECT COUNT(p) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination);
        long totalFlights = getSingleLongResult("SELECT COUNT(DISTINCT p.flightNumber) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination);
        long totalAgents = getSingleLongResult("SELECT COUNT(DISTINCT p.agentNameRaw) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination);
        
        BigDecimal totalRevenue = getSingleBigDecimalResult("SELECT SUM(p.debitEgp) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination);
        BigDecimal totalExpenses = getSingleBigDecimalResult("SELECT SUM(p.creditEgp) FROM ManifestPassenger p " + whereClause, startDate, endDate, agent, destination);
        
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        Double profitMargin = 0.0;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).doubleValue();
        }

        // Charts
        List<DashboardDto.ChartItem> destinationChart = getChartData("SELECT p.destination, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.destination ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, totalPassengers);
        List<DashboardDto.ChartItem> serviceChart = getChartData("SELECT p.serviceType, SUM(p.debitEgp) FROM ManifestPassenger p " + whereClause + " GROUP BY p.serviceType ORDER BY SUM(p.debitEgp) DESC", startDate, endDate, agent, destination, totalRevenue.longValue());
        List<DashboardDto.ChartItem> airlineChart = getChartData("SELECT p.flightNumber, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.flightNumber ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, totalPassengers);
        List<DashboardDto.ChartItem> categoryChart = getChartData("SELECT p.passengerCategory, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.passengerCategory ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, totalPassengers);
        List<DashboardDto.ChartItem> topAgents = getChartData("SELECT p.agentNameRaw, COUNT(p) FROM ManifestPassenger p " + whereClause + " GROUP BY p.agentNameRaw ORDER BY COUNT(p) DESC", startDate, endDate, agent, destination, totalPassengers);

        // Limit top agents
        if (topAgents.size() > 5) {
            topAgents = topAgents.subList(0, 5);
        }

        // Latest Flights (guarantees data shows up if there are any flights)
        String todaysFlightsQueryStr = "SELECT p.arrivalTime, p.departurePort, p.flightNumber, COUNT(p), p.serviceType FROM ManifestPassenger p " + 
                                       " WHERE p.batch.status = 'PUBLISHED' " +
                                       " GROUP BY p.departureDate, p.arrivalTime, p.departurePort, p.flightNumber, p.serviceType ORDER BY p.departureDate DESC, p.arrivalTime ASC";
        Query tfQuery = entityManager.createQuery(todaysFlightsQueryStr);
        tfQuery.setMaxResults(10);
        List<Object[]> tfResults = tfQuery.getResultList();
        
        List<DashboardDto.FlightItem> todaysFlights = new ArrayList<>();
        for (Object[] row : tfResults) {
            todaysFlights.add(DashboardDto.FlightItem.builder()
                    .time(row[0] != null ? row[0].toString() : "--:--")
                    .from(row[1] != null ? row[1].toString() : "Unknown")
                    .to(row[2] != null ? row[2].toString() : "Unknown")
                    .passengers(((Number) row[3]).longValue())
                    .type(row[4] != null ? row[4].toString() : "Unknown")
                    .build());
        }

        return DashboardDto.DashboardSummaryResponse.builder()
                .totalPassengers(totalPassengers)
                .totalFlights(totalFlights)
                .totalAgents(totalAgents)
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .netProfit(netProfit)
                .profitMargin(profitMargin)
                .currency("EGP")
                .passengersByDestination(destinationChart)
                .revenueByServiceType(serviceChart)
                .passengersByAirline(airlineChart)
                .passengersByCategory(categoryChart)
                .topAgents(topAgents)
                .todaysFlights(todaysFlights)
                .build();
    }

    private long getSingleLongResult(String jpql, LocalDate startDate, LocalDate endDate, String agent, String destination) {
        Query query = entityManager.createQuery(jpql);
        if (startDate != null) query.setParameter("startDate", startDate);
        if (endDate != null) query.setParameter("endDate", endDate);
        if (agent != null && !agent.trim().isEmpty()) query.setParameter("agent", agent);
        if (destination != null && !destination.trim().isEmpty()) query.setParameter("destination", destination);
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).longValue() : 0L;
    }

    private BigDecimal getSingleBigDecimalResult(String jpql, LocalDate startDate, LocalDate endDate, String agent, String destination) {
        Query query = entityManager.createQuery(jpql);
        if (startDate != null) query.setParameter("startDate", startDate);
        if (endDate != null) query.setParameter("endDate", endDate);
        if (agent != null && !agent.trim().isEmpty()) query.setParameter("agent", agent);
        if (destination != null && !destination.trim().isEmpty()) query.setParameter("destination", destination);
        Object result = query.getSingleResult();
        return result != null ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
    }

    private List<DashboardDto.ChartItem> getChartData(String jpql, LocalDate startDate, LocalDate endDate, String agent, String destination, long totalForPercent) {
        Query query = entityManager.createQuery(jpql);
        if (startDate != null) query.setParameter("startDate", startDate);
        if (endDate != null) query.setParameter("endDate", endDate);
        if (agent != null && !agent.trim().isEmpty()) query.setParameter("agent", agent);
        if (destination != null && !destination.trim().isEmpty()) query.setParameter("destination", destination);
        
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
