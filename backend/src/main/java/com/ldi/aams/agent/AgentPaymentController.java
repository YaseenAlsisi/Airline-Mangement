package com.ldi.aams.agent;

import com.ldi.aams.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent-payments")
@RequiredArgsConstructor
public class AgentPaymentController {

    private final AgentPaymentService agentPaymentService;

    @GetMapping
    @PreAuthorize("hasAuthority('AGENT_VIEW')")
    public ResponseEntity<ApiResponse<List<AgentPaymentDto.AgentPaymentResponse>>> getAllPayments(
            @RequestParam(required = false) String agentNameRaw) {
        
        List<AgentPaymentDto.AgentPaymentResponse> payments;
        if (agentNameRaw != null && !agentNameRaw.trim().isEmpty()) {
            payments = agentPaymentService.getPaymentsByAgent(agentNameRaw);
        } else {
            payments = agentPaymentService.getAllPayments();
        }
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<ApiResponse<AgentPaymentDto.AgentPaymentResponse>> createPayment(
            @Valid @RequestBody AgentPaymentDto.CreateAgentPaymentRequest request) {
        return new ResponseEntity<>(ApiResponse.success(agentPaymentService.createPayment(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<ApiResponse<AgentPaymentDto.AgentPaymentResponse>> updatePayment(
            @PathVariable UUID id, @Valid @RequestBody AgentPaymentDto.UpdateAgentPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(agentPaymentService.updatePayment(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable UUID id) {
        agentPaymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
