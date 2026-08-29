package com.ldi.aams.agent;

import com.ldi.aams.agent.internal.payment.AgentPayment;
import com.ldi.aams.agent.internal.payment.AgentPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentPaymentService {
    private final AgentPaymentRepository agentPaymentRepository;

    @Transactional(readOnly = true)
    public List<AgentPaymentDto.AgentPaymentResponse> getPaymentsByAgent(String agentNameRaw) {
        return agentPaymentRepository.findByAgentNameRawOrderByPaymentDateDesc(agentNameRaw).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgentPaymentDto.AgentPaymentResponse> getAllPayments() {
        return agentPaymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AgentPaymentDto.AgentPaymentResponse createPayment(AgentPaymentDto.CreateAgentPaymentRequest request) {
        AgentPayment payment = AgentPayment.builder()
                .agentNameRaw(request.getAgentNameRaw())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentType(request.getPaymentType() != null ? request.getPaymentType() : "CREDIT")
                .paymentDate(request.getPaymentDate())
                .note(request.getNote())
                .build();
        
        AgentPayment saved = agentPaymentRepository.save(payment);
        return mapToResponse(saved);
    }

    @Transactional
    public AgentPaymentDto.AgentPaymentResponse updatePayment(UUID id, AgentPaymentDto.UpdateAgentPaymentRequest request) {
        AgentPayment payment = agentPaymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        
        payment.setAmount(request.getAmount());
        if (request.getCurrency() != null) {
            payment.setCurrency(request.getCurrency());
        }
        if (request.getPaymentType() != null) {
            payment.setPaymentType(request.getPaymentType());
        }
        payment.setPaymentDate(request.getPaymentDate());
        payment.setNote(request.getNote());
        
        AgentPayment updated = agentPaymentRepository.save(payment);
        return mapToResponse(updated);
    }

    @Transactional
    public void deletePayment(UUID id) {
        AgentPayment payment = agentPaymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        agentPaymentRepository.delete(payment);
    }

    private AgentPaymentDto.AgentPaymentResponse mapToResponse(AgentPayment payment) {
        return AgentPaymentDto.AgentPaymentResponse.builder()
                .id(payment.getId())
                .agentNameRaw(payment.getAgentNameRaw())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentType(payment.getPaymentType() != null ? payment.getPaymentType() : "CREDIT")
                .paymentDate(payment.getPaymentDate())
                .note(payment.getNote())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
