package com.ldi.aams.agent;

import com.ldi.aams.agent.internal.Agent;
import com.ldi.aams.agent.internal.AgentMapper;
import com.ldi.aams.agent.internal.AgentRepository;
import com.ldi.aams.manifest.internal.ManifestPassengerRepository;
import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;
    private final AgentMapper agentMapper;
    private final ManifestPassengerRepository passengerRepository;
    private final com.ldi.aams.agent.internal.balance.AgentTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public Page<AgentDto.AgentResponse> getAllAgents(Pageable pageable) {
        return agentRepository.findAll(pageable).map(agentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AgentDto.AgentResponse getAgentById(UUID id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        return agentMapper.toResponse(agent);
    }

    @Transactional
    public AgentDto.AgentResponse createAgent(AgentDto.CreateAgentRequest request) {
        if (agentRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Agent code already exists", "AGENT_CODE_EXISTS");
        }

        Agent agent = Agent.builder()
                .code(request.getCode())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .creditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .build();

        return agentMapper.toResponse(agentRepository.save(agent));
    }

    @Transactional
    public AgentDto.AgentResponse updateAgent(UUID id, AgentDto.UpdateAgentRequest request) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));

        agent.setName(request.getName());
        agent.setEmail(request.getEmail());
        agent.setPhone(request.getPhone());
        agent.setAddress(request.getAddress());
        
        if (request.getStatus() != null) {
            agent.setStatus(request.getStatus());
        }
        if (request.getCreditLimit() != null) {
            agent.setCreditLimit(request.getCreditLimit());
        }
        if (request.getCurrency() != null) {
            agent.setCurrency(request.getCurrency());
        }

        return agentMapper.toResponse(agentRepository.save(agent));
    }

    @Transactional
    public void deleteAgent(UUID id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        
        agent.setStatus("DELETED");
        agentRepository.save(agent);
    }

    @Transactional(readOnly = true)
    public AgentDto.BalanceReportResponse getBalanceReport(BigDecimal ticketPrice) {
        java.util.List<AgentDto.AgentBalanceSummary> allBalances = transactionRepository.calculateAllAgentBalances();
        
        java.util.List<AgentDto.AgentBalanceSummary> agents = new java.util.ArrayList<>();
        java.util.List<AgentDto.AgentBalanceSummary> badDebts = new java.util.ArrayList<>();
        
        BigDecimal grandTotalDebitUsd = BigDecimal.ZERO;
        BigDecimal grandTotalCreditUsd = BigDecimal.ZERO;
        BigDecimal grandTotalDebitEgp = BigDecimal.ZERO;
        BigDecimal grandTotalCreditEgp = BigDecimal.ZERO;
        
        int serialNumber = 1;
        for (AgentDto.AgentBalanceSummary summary : allBalances) {
            if (ticketPrice != null && ticketPrice.compareTo(BigDecimal.ZERO) > 0) {
                summary.setTicketEquivalent(summary.getDebtEgp().divide(ticketPrice, 2, java.math.RoundingMode.HALF_UP));
            }
            
            if ("BAD_DEBT".equals(summary.getDebtCategory())) {
                badDebts.add(summary);
            } else {
                summary.setSerialNumber(serialNumber++);
                agents.add(summary);
            }
            
            grandTotalDebitUsd = grandTotalDebitUsd.add(summary.getTotalDebitUsd());
            grandTotalCreditUsd = grandTotalCreditUsd.add(summary.getTotalCreditUsd());
            grandTotalDebitEgp = grandTotalDebitEgp.add(summary.getTotalDebitEgp());
            grandTotalCreditEgp = grandTotalCreditEgp.add(summary.getTotalCreditEgp());
        }
        
        AgentDto.AgentBalanceSummary grandTotal = AgentDto.AgentBalanceSummary.builder()
                .totalDebitUsd(grandTotalDebitUsd)
                .totalCreditUsd(grandTotalCreditUsd)
                .debtUsd(grandTotalDebitUsd.subtract(grandTotalCreditUsd))
                .totalDebitEgp(grandTotalDebitEgp)
                .totalCreditEgp(grandTotalCreditEgp)
                .debtEgp(grandTotalDebitEgp.subtract(grandTotalCreditEgp))
                .build();
                
        if (ticketPrice != null && ticketPrice.compareTo(BigDecimal.ZERO) > 0) {
            grandTotal.setTicketEquivalent(grandTotal.getDebtEgp().divide(ticketPrice, 2, java.math.RoundingMode.HALF_UP));
        }

        return AgentDto.BalanceReportResponse.builder()
                .agents(agents)
                .badDebts(badDebts)
                .grandTotal(grandTotal)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AgentDto.AgentTransactionResponse> getAgentTransactions(UUID agentId, String type, Pageable pageable) {
        Page<com.ldi.aams.agent.internal.balance.AgentTransaction> page;
        if (type != null && !type.isEmpty()) {
            page = transactionRepository.findByAgentIdAndTransactionType(agentId, type, pageable);
        } else {
            page = transactionRepository.findByAgentId(agentId, pageable);
        }
        return page.map(this::mapTransactionToResponse);
    }

    @Transactional
    public AgentDto.AgentTransactionResponse addTransaction(UUID agentId, AgentDto.CreateTransactionRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        com.ldi.aams.agent.internal.balance.AgentTransaction txn = com.ldi.aams.agent.internal.balance.AgentTransaction.builder()
                .agent(agent)
                .transactionType(request.getTransactionType())
                .passengerName(request.getPassengerName())
                .birthDate(request.getBirthDate())
                .nationalId(request.getNationalId())
                .passportNumber(request.getPassportNumber())
                .departurePort(request.getDeparturePort())
                .destination(request.getDestination())
                .airline(request.getAirline())
                .departureDate(request.getDepartureDate())
                .departureTime(request.getDepartureTime())
                .investmentSupplier(request.getInvestmentSupplier())
                .serviceType(request.getServiceType())
                .passengerCategory(request.getPassengerCategory())
                .note(request.getNote())
                .note2(request.getNote2())
                .note3(request.getNote3())
                .paymentDescription(request.getPaymentDescription())
                .debitUsd(request.getDebitUsd() != null ? request.getDebitUsd() : BigDecimal.ZERO)
                .creditUsd(request.getCreditUsd() != null ? request.getCreditUsd() : BigDecimal.ZERO)
                .debitEgp(request.getDebitEgp() != null ? request.getDebitEgp() : BigDecimal.ZERO)
                .creditEgp(request.getCreditEgp() != null ? request.getCreditEgp() : BigDecimal.ZERO)
                .build();

        return mapTransactionToResponse(transactionRepository.save(txn));
    }

    @Transactional
    public AgentDto.AgentTransactionResponse recordPayment(UUID agentId, AgentDto.RecordPaymentRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        com.ldi.aams.agent.internal.balance.AgentTransaction txn = com.ldi.aams.agent.internal.balance.AgentTransaction.builder()
                .agent(agent)
                .transactionType("PAYMENT")
                .paymentDescription(request.getPaymentDescription())
                .creditUsd(request.getCreditUsd() != null ? request.getCreditUsd() : BigDecimal.ZERO)
                .creditEgp(request.getCreditEgp() != null ? request.getCreditEgp() : BigDecimal.ZERO)
                .debitUsd(BigDecimal.ZERO)
                .debitEgp(BigDecimal.ZERO)
                .build();

        return mapTransactionToResponse(transactionRepository.save(txn));
    }

    private AgentDto.AgentTransactionResponse mapTransactionToResponse(com.ldi.aams.agent.internal.balance.AgentTransaction txn) {
        return AgentDto.AgentTransactionResponse.builder()
                .id(txn.getId())
                .transactionType(txn.getTransactionType())
                .isImported(txn.getImportBatchId() != null)
                .passengerName(txn.getPassengerName())
                .birthDate(txn.getBirthDate())
                .nationalId(txn.getNationalId())
                .passportNumber(txn.getPassportNumber())
                .departurePort(txn.getDeparturePort())
                .destination(txn.getDestination())
                .airline(txn.getAirline())
                .departureDate(txn.getDepartureDate())
                .departureTime(txn.getDepartureTime())
                .investmentSupplier(txn.getInvestmentSupplier())
                .serviceType(txn.getServiceType())
                .passengerCategory(txn.getPassengerCategory())
                .note(txn.getNote())
                .note2(txn.getNote2())
                .note3(txn.getNote3())
                .paymentDescription(txn.getPaymentDescription())
                .debitUsd(txn.getDebitUsd())
                .creditUsd(txn.getCreditUsd())
                .debitEgp(txn.getDebitEgp())
                .creditEgp(txn.getCreditEgp())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
