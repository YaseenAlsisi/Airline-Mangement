package com.ldi.aams.report;

import com.ldi.aams.transaction.internal.Transaction;
import com.ldi.aams.transaction.internal.TransactionRepository;
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

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public ReportDto.SalesSummaryResponse getSalesSummary(LocalDate startDate, LocalDate endDate) {
        // Fetch all transactions and filter in memory for simplicity in this MVP.
        // In a real production system with millions of rows, this should be done via a highly optimized JPQL/SQL GROUP BY query.
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> (startDate == null || !t.getIssueDate().isBefore(startDate)) &&
                             (endDate == null || !t.getIssueDate().isAfter(endDate)))
                .collect(Collectors.toList());

        long totalTickets = transactions.size();
        BigDecimal totalBaseFares = transactions.stream().map(Transaction::getBaseFare).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTaxes = transactions.stream().map(Transaction::getTax).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalGrossSales = transactions.stream().map(Transaction::getTotalFare).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAgentCommissions = transactions.stream().map(Transaction::getAgentCommission).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNetPayable = transactions.stream().map(Transaction::getNetPayable).reduce(BigDecimal.ZERO, BigDecimal::add);

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
