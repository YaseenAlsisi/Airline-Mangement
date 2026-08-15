package com.ldi.aams.manifest;

import com.ldi.aams.manifest.internal.ManifestMapper;
import com.ldi.aams.manifest.internal.ManifestPassenger;
import com.ldi.aams.manifest.internal.ManifestPassengerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
public class AgentManifestController {

    private final ManifestPassengerRepository passengerRepository;
    private final ManifestMapper mapper;

    @GetMapping("/manifest-summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getManifestSummary() {
        List<ManifestPassenger> allPublished = passengerRepository.findAll().stream()
                .filter(p -> "PUBLISHED".equals(p.getBatch().getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> summary = allPublished.stream()
                .filter(p -> p.getAgent() != null)
                .collect(Collectors.groupingBy(p -> p.getAgent().getId()))
                .entrySet().stream()
                .map(entry -> {
                    UUID agentId = entry.getKey();
                    List<ManifestPassenger> passengers = entry.getValue();
                    String agentName = passengers.get(0).getAgent().getName();
                    long count = passengers.size();
                    Map<String, Object> row = new HashMap<>();
                    row.put("agentId", agentId);
                    row.put("agentName", agentName);
                    row.put("passengerCount", count);
                    return row;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{agentId}/manifest-passengers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ManifestDto.PassengerRowResponse>> getAgentPassengers(
            @PathVariable UUID agentId,
            Pageable pageable) {
        List<ManifestPassenger> allForAgent = passengerRepository.findAll().stream()
                .filter(p -> p.getAgent() != null && p.getAgent().getId().equals(agentId))
                .filter(p -> "PUBLISHED".equals(p.getBatch().getStatus()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allForAgent.size());
        List<ManifestPassenger> pageContent = allForAgent.subList(start, end);

        Page<ManifestDto.PassengerRowResponse> page = new PageImpl<>(
                pageContent.stream().map(mapper::toPassengerRowResponse).collect(Collectors.toList()),
                pageable,
                allForAgent.size()
        );

        return ResponseEntity.ok(page);
    }

    @GetMapping("/all-manifest-passengers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ManifestDto.PassengerRowResponse>> getAllPassengers(Pageable pageable) {
        List<ManifestPassenger> allPublished = passengerRepository.findAll().stream()
                .filter(p -> "PUBLISHED".equals(p.getBatch().getStatus()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allPublished.size());
        
        List<ManifestPassenger> pageContent;
        if (start > allPublished.size()) {
            pageContent = Collections.emptyList();
        } else {
            pageContent = allPublished.subList(start, end);
        }

        Page<ManifestDto.PassengerRowResponse> page = new PageImpl<>(
                pageContent.stream().map(mapper::toPassengerRowResponse).collect(Collectors.toList()),
                pageable,
                allPublished.size()
        );

        return ResponseEntity.ok(page);
    }
}
