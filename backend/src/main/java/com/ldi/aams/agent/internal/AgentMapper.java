package com.ldi.aams.agent.internal;

import com.ldi.aams.agent.AgentDto;
import org.springframework.stereotype.Component;

@Component
public class AgentMapper {

    public AgentDto.AgentResponse toResponse(Agent agent) {
        return AgentDto.AgentResponse.builder()
                .id(agent.getId())
                .code(agent.getCode())
                .name(agent.getName())
                .email(agent.getEmail())
                .phone(agent.getPhone())
                .address(agent.getAddress())
                .status(agent.getStatus())
                .creditLimit(agent.getCreditLimit())
                .currency(agent.getCurrency())
                .createdAt(agent.getCreatedAt())
                .updatedAt(agent.getUpdatedAt())
                .build();
    }
}
