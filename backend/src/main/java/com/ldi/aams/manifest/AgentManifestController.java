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
    private final ManifestImportService manifestImportService;

    @GetMapping("/manifest-summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getManifestSummary() {
        return ResponseEntity.ok(passengerRepository.getManifestSummary());
    }

    @GetMapping("/{agentId}/manifest-passengers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ManifestDto.PassengerRowResponse>> getAgentPassengers(
            @PathVariable UUID agentId,
            Pageable pageable) {
        Page<ManifestPassenger> page = passengerRepository.findPublishedAndValidByAgentId(agentId, pageable);
        return ResponseEntity.ok(page.map(mapper::toPassengerRowResponse));
    }

    @GetMapping("/all-manifest-passengers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ManifestDto.PassengerRowResponse>> getAllPassengers(Pageable pageable) {
        Page<ManifestPassenger> page = passengerRepository.findAllPublishedAndValid(pageable);
        return ResponseEntity.ok(page.map(mapper::toPassengerRowResponse));
    }

    @PostMapping("/{agentId}/manifest-passengers")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<ManifestDto.PassengerRowResponse> addManifestPassenger(
            @PathVariable UUID agentId,
            @RequestBody ManifestDto.PassengerRowUpdateRequest request) {
        ManifestPassenger added = manifestImportService.addPublishedPassenger(agentId, request);
        return ResponseEntity.ok(mapper.toPassengerRowResponse(added));
    }

    @PutMapping("/manifest-passengers/{id}")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<ManifestDto.PassengerRowResponse> updateManifestPassenger(
            @PathVariable UUID id,
            @RequestBody ManifestDto.PassengerRowUpdateRequest request) {
        ManifestPassenger updated = manifestImportService.updatePublishedPassenger(id, request);
        return ResponseEntity.ok(mapper.toPassengerRowResponse(updated));
    }

    @DeleteMapping("/manifest-passengers/{id}")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<Void> deleteManifestPassenger(@PathVariable UUID id) {
        manifestImportService.deletePublishedPassenger(id);
        return ResponseEntity.noContent().build();
    }
}
