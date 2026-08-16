package com.ldi.aams.report;

import com.ldi.aams.manifest.internal.ManifestPassenger;
import com.ldi.aams.manifest.internal.ManifestPassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ManifestPassengerRepository manifestPassengerRepository;

    @Transactional(readOnly = true)
    public ReportDto.SalesSummaryResponse getSalesSummary(LocalDate startDate, LocalDate endDate) {
        List<ManifestPassenger> passengers = manifestPassengerRepository.findAll().stream()
                .filter(p -> (startDate == null || (p.getDepartureDate() != null && !p.getDepartureDate().isBefore(startDate))) &&
                             (endDate == null || (p.getDepartureDate() != null && !p.getDepartureDate().isAfter(endDate))))
                .collect(Collectors.toList());

        long totalTickets = passengers.size();
        BigDecimal totalBaseFares = passengers.stream()
                .map(ManifestPassenger::getDebitEgp)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTaxes = BigDecimal.ZERO;
        BigDecimal totalGrossSales = passengers.stream()
                .map(ManifestPassenger::getDebitEgp)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAgentCommissions = passengers.stream()
                .map(ManifestPassenger::getCreditEgp)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNetPayable = totalGrossSales.subtract(totalAgentCommissions);

        return ReportDto.SalesSummaryResponse.builder()
                .totalTickets(totalTickets)
                .totalBaseFares(totalBaseFares)
                .totalTaxes(totalTaxes)
                .totalGrossSales(totalGrossSales)
                .totalAgentCommissions(totalAgentCommissions)
                .totalNetPayable(totalNetPayable)
                .build();
    }
}
