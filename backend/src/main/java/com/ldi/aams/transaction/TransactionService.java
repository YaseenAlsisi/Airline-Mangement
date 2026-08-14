package com.ldi.aams.transaction;

import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import com.ldi.aams.pricelist.PriceListDto;
import com.ldi.aams.pricelist.PriceListService;
import com.ldi.aams.transaction.internal.Transaction;
import com.ldi.aams.transaction.internal.TransactionMapper;
import com.ldi.aams.transaction.internal.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final PriceListService priceListService;

    @Transactional(readOnly = true)
    public Page<TransactionDto.TransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(transactionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionDto.TransactionResponse getTransactionById(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        return transactionMapper.toResponse(transaction);
    }

    @Transactional
    public TransactionDto.TransactionResponse createTransaction(TransactionDto.CreateTransactionRequest request) {
        if (transactionRepository.existsByTicketNumber(request.getTicketNumber())) {
            throw new BusinessException("Ticket number already exists", "TICKET_EXISTS");
        }

        Transaction transaction = Transaction.builder()
                .ticketNumber(request.getTicketNumber())
                .pnr(request.getPnr())
                .passengerName(request.getPassengerName())
                .airlineId(request.getAirlineId())
                .agentId(request.getAgentId())
                .issueDate(request.getIssueDate())
                .baseFare(request.getBaseFare())
                .tax(request.getTax())
                .status(request.getStatus() != null ? request.getStatus() : "PENDING")
                .build();

        calculateFinancials(transaction);

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionDto.TransactionResponse updateTransaction(UUID id, TransactionDto.UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        transaction.setPnr(request.getPnr());
        transaction.setPassengerName(request.getPassengerName());
        transaction.setAirlineId(request.getAirlineId());
        transaction.setAgentId(request.getAgentId());
        transaction.setIssueDate(request.getIssueDate());
        transaction.setBaseFare(request.getBaseFare());
        transaction.setTax(request.getTax());
        
        if (request.getStatus() != null) {
            transaction.setStatus(request.getStatus());
        }

        calculateFinancials(transaction);

        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    private void calculateFinancials(Transaction transaction) {
        BigDecimal totalFare = transaction.getBaseFare().add(transaction.getTax());
        transaction.setTotalFare(totalFare);

        // Find applicable price list
        PriceListDto.PriceListResponse priceList = priceListService.findBestPriceList(
                transaction.getAgentId(), 
                transaction.getAirlineId(), 
                transaction.getIssueDate()
        );

        BigDecimal agentCommission = BigDecimal.ZERO;
        BigDecimal markup = BigDecimal.ZERO;

        if (priceList != null) {
            if (priceList.getCommissionPercentage() != null && priceList.getCommissionPercentage().compareTo(BigDecimal.ZERO) > 0) {
                agentCommission = transaction.getBaseFare()
                        .multiply(priceList.getCommissionPercentage())
                        .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            }
            if (priceList.getMarkupAmount() != null) {
                markup = priceList.getMarkupAmount();
            }
        }

        transaction.setAgentCommission(agentCommission);
        
        // net_payable = total_fare - agent_commission + markup
        BigDecimal netPayable = totalFare.subtract(agentCommission).add(markup);
        transaction.setNetPayable(netPayable);
        
        // Auto-update status if it was pending
        if ("PENDING".equals(transaction.getStatus())) {
            transaction.setStatus("CALCULATED");
        }
    }
}
