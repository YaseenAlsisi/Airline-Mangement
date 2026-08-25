package com.ldi.aams.agent;

import com.ldi.aams.agent.internal.balance.AgentImportBatchRepository;
import com.ldi.aams.agent.internal.balance.AgentImportResult;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent-accounts/import")
@RequiredArgsConstructor
public class AgentAccountImportController {

    private final AgentAccountImportService importService;
    private final AgentImportBatchRepository batchRepository;

    @Value("classpath:data/agent-accounts.xlsx")
    private Resource excelResource;

    @GetMapping("/status")
    @PreAuthorize("hasAuthority('AGENT_VIEW')")
    public ResponseEntity<?> getImportStatus() {
        boolean exists = batchRepository.existsByStatusNot("DELETED");
        return ResponseEntity.ok(Map.of("isSeeded", exists));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<AgentImportResult> uploadAndReimport(@RequestParam("file") MultipartFile file) throws Exception {
        // Need to get current user ID ideally, but using null for now as per seeder
        AgentImportResult result = importService.reimportFromStream(file.getInputStream(), file.getOriginalFilename(), null);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{batchId}")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<Void> deleteImportData(@PathVariable UUID batchId) {
        importService.deleteImportData(batchId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reseed")
    @PreAuthorize("hasAuthority('AGENT_EDIT')")
    public ResponseEntity<AgentImportResult> reseedData() throws Exception {
        AgentImportResult result = importService.reimportFromStream(excelResource.getInputStream(), "agent-accounts.xlsx", null);
        return ResponseEntity.ok(result);
    }
}
