package com.ldi.aams.manifest;

import com.ldi.aams.manifest.internal.ManifestImportBatch;
import com.ldi.aams.manifest.internal.ManifestMapper;
import com.ldi.aams.manifest.internal.ManifestPassenger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/manifest-imports")
@RequiredArgsConstructor
public class ManifestImportController {

    private final ManifestImportService service;
    private final ManifestMapper mapper;

    @PostMapping("/preview")
    @PreAuthorize("hasAnyAuthority('MANIFEST_IMPORT_CREATE', 'AGENT_VIEW', 'AGENT_CREATE', 'AGENT_EDIT')")
    public ResponseEntity<ManifestDto.BatchPreviewResponse> previewImport(@RequestParam("file") MultipartFile file) throws Exception {
        // Use a dummy uploader ID for now since security principal might not map to UUID cleanly in this sample, or we can just pass null
        ManifestImportBatch batch = service.previewManifestImport(file, null);
        Page<ManifestPassenger> rowsPage = service.getRows(batch.getId(), Pageable.unpaged()); // Fetch all for preview response
        return ResponseEntity.ok(mapper.toBatchPreviewResponse(batch, rowsPage.getContent()));
    }

    @GetMapping("/{batchId}/rows")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ManifestDto.PassengerRowResponse>> getRows(
            @PathVariable UUID batchId,
            Pageable pageable) {
        Page<ManifestPassenger> rows = service.getRows(batchId, pageable);
        return ResponseEntity.ok(rows.map(mapper::toPassengerRowResponse));
    }

    @PutMapping("/{batchId}/rows/{rowId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ManifestDto.PassengerRowResponse> updateRow(
            @PathVariable UUID batchId,
            @PathVariable UUID rowId,
            @RequestBody ManifestDto.PassengerRowUpdateRequest request) {
        ManifestPassenger updated = service.updateRow(batchId, rowId, request);
        return ResponseEntity.ok(mapper.toPassengerRowResponse(updated));
    }

    @PostMapping("/{batchId}/publish")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ManifestDto.BatchResponse> publishBatch(@PathVariable UUID batchId) {
        ManifestImportBatch batch = service.publishBatch(batchId);
        return ResponseEntity.ok(mapper.toBatchResponse(batch));
    }
}
