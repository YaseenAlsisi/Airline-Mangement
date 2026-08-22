package com.ldi.aams.agent;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.common.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    @GetMapping
    @PreAuthorize("hasAuthority('AGENT_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<AgentDto.AgentResponse>>> getAllAgents(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(agentService.getAllAgents(pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AGENT_VIEW')")
    public ResponseEntity<ApiResponse<AgentDto.AgentResponse>> getAgentById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(agentService.getAgentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('AGENT_CREATE')")
    public ResponseEntity<ApiResponse<AgentDto.AgentResponse>> createAgent(@Valid @RequestBody AgentDto.CreateAgentRequest request) {
        return new ResponseEntity<>(ApiResponse.success(agentService.createAgent(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<ApiResponse<AgentDto.AgentResponse>> updateAgent(@PathVariable UUID id, @Valid @RequestBody AgentDto.UpdateAgentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(agentService.updateAgent(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deleteAgent(@PathVariable UUID id) {
        agentService.deleteAgent(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
