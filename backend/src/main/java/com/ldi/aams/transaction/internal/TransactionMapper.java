package com.ldi.aams.transaction.internal;

import com.ldi.aams.transaction.TransactionDto;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionDto.TransactionResponse toResponse(Transaction transaction) {
        return TransactionDto.TransactionResponse.builder()
                .id(transaction.getId())
                .ticketNumber(transaction.getTicketNumber())
                .pnr(transaction.getPnr())
                .passengerName(transaction.getPassengerName())
                .airlineId(transaction.getAirlineId())
                .agentId(transaction.getAgentId())
                .issueDate(transaction.getIssueDate())
                .baseFare(transaction.getBaseFare())
                .tax(transaction.getTax())
                .totalFare(transaction.getTotalFare())
                .agentCommission(transaction.getAgentCommission())
                .netPayable(transaction.getNetPayable())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
