package com.ldi.aams.transaction;

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
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @PreAuthorize("hasAuthority('TRANSACTION_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionDto.TransactionResponse>>> getAllTransactions(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(transactionService.getAllTransactions(pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TRANSACTION_VIEW')")
    public ResponseEntity<ApiResponse<TransactionDto.TransactionResponse>> getTransactionById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getTransactionById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('TRANSACTION_CREATE')")
    public ResponseEntity<ApiResponse<TransactionDto.TransactionResponse>> createTransaction(@Valid @RequestBody TransactionDto.CreateTransactionRequest request) {
        return new ResponseEntity<>(ApiResponse.success(transactionService.createTransaction(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TRANSACTION_EDIT')")
    public ResponseEntity<ApiResponse<TransactionDto.TransactionResponse>> updateTransaction(@PathVariable UUID id, @Valid @RequestBody TransactionDto.UpdateTransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.updateTransaction(id, request)));
    }
}
