package com.ldi.aams.manifest;

import com.ldi.aams.manifest.internal.ManifestImportBatch;
import com.ldi.aams.manifest.internal.ManifestMapper;
import com.ldi.aams.manifest.internal.ManifestPassenger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
        ManifestImportBatch batch = service.previewManifestImport(file, null);
        Page<ManifestPassenger> rowsPage = service.getRows(batch.getId(), Pageable.unpaged());
        return ResponseEntity.ok(mapper.toBatchPreviewResponse(batch, rowsPage.getContent()));
    }

    @PostMapping("/empty-batch")
    @PreAuthorize("hasAnyAuthority('MANIFEST_IMPORT_CREATE', 'AGENT_VIEW', 'AGENT_CREATE', 'AGENT_EDIT')")
    public ResponseEntity<ManifestDto.BatchPreviewResponse> createEmptyBatch() {
        ManifestImportBatch batch = service.createEmptyBatch(null);
        return ResponseEntity.ok(mapper.toBatchPreviewResponse(batch, List.of()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('MANIFEST_IMPORT_VIEW', 'AGENT_VIEW')")
    public ResponseEntity<Page<ManifestDto.BatchResponse>> getAllBatches(Pageable pageable) {
        Page<ManifestImportBatch> batches = service.getAllBatches(pageable);
        return ResponseEntity.ok(batches.map(mapper::toBatchResponse));
    }

    @GetMapping("/{batchId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ManifestDto.BatchPreviewResponse> getBatchPreview(@PathVariable UUID batchId) {
        ManifestImportBatch batch = service.getBatch(batchId);
        Page<ManifestPassenger> rowsPage = service.getRows(batchId, Pageable.unpaged());
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

    @PostMapping("/{batchId}/rows")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ManifestDto.PassengerRowResponse> addRow(
            @PathVariable UUID batchId,
            @RequestBody ManifestDto.PassengerRowUpdateRequest request) {
        ManifestPassenger added = service.addRow(batchId, request);
        return ResponseEntity.ok(mapper.toPassengerRowResponse(added));
    }

    @DeleteMapping("/{batchId}/rows/{rowId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteRow(
            @PathVariable UUID batchId,
            @PathVariable UUID rowId) {
        service.deleteRow(batchId, rowId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{batchId}/rows/bulk")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteRowsBulk(
            @PathVariable UUID batchId,
            @RequestBody List<UUID> rowIds) {
        service.deleteRows(batchId, rowIds);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{batchId}/publish")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ManifestDto.BatchResponse> publishBatch(@PathVariable UUID batchId) {
        ManifestImportBatch batch = service.publishBatch(batchId);
        return ResponseEntity.ok(mapper.toBatchResponse(batch));
    }

    @PostMapping("/{batchId}/calculate-prices")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ManifestDto.BatchPreviewResponse> calculatePrices(@PathVariable UUID batchId) {
        service.calculatePrices(batchId);
        ManifestImportBatch batch = service.getBatch(batchId);
        Page<ManifestPassenger> rowsPage = service.getRows(batchId, Pageable.unpaged());
        return ResponseEntity.ok(mapper.toBatchPreviewResponse(batch, rowsPage.getContent()));
    }

    @DeleteMapping("/bulk")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteBatches(@RequestBody List<UUID> batchIds) {
        service.deleteBatches(batchIds);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{batchId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteBatch(@PathVariable UUID batchId) {
        service.deleteBatch(batchId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{batchId}/export")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportToExcel(@PathVariable UUID batchId) {
        byte[] excelData = service.exportToExcel(batchId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"manifest_export.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }

    @DeleteMapping("/reset")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> resetAllPublishedData() {
        service.resetAllPublishedData();
        return ResponseEntity.noContent().build();
    }
}
