package com.ldi.aams.transaction;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.transaction.internal.ExcelImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class ImportController {

    private final ExcelImportService excelImportService;

    @PostMapping("/transactions")
    @PreAuthorize("hasAuthority('TRANSACTION_CREATE')")
    public ResponseEntity<ApiResponse<ImportDto.ImportResult>> importTransactions(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(excelImportService.importTransactions(file)));
    }
}
