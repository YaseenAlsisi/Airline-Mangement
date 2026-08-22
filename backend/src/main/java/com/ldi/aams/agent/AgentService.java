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
}
