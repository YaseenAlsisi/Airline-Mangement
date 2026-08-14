package com.ldi.aams.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class ImportDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportResult {
        private int totalRows;
        private int successfulImports;
        private int failedImports;
        private List<String> errors;
    }
}
