package com.ldi.aams.transaction.internal;

import com.ldi.aams.agent.internal.Agent;
import com.ldi.aams.agent.internal.AgentRepository;
import com.ldi.aams.airline.internal.Airline;
import com.ldi.aams.airline.internal.AirlineRepository;
import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.transaction.ImportDto;
import com.ldi.aams.transaction.TransactionDto;
import com.ldi.aams.transaction.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportService {

    private final TransactionService transactionService;
    private final AgentRepository agentRepository;
    private final AirlineRepository airlineRepository;

    public ImportDto.ImportResult importTransactions(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("File is empty", "FILE_EMPTY");
        }

        int totalRows = 0;
        int successful = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            for (Row row : sheet) {
                if (row.getRowNum() == 0) {
                    continue; // Skip header row
                }
                
                // Stop processing if we hit an empty row
                if (isRowEmpty(row)) {
                    break;
                }

                totalRows++;
                try {
                    processRow(row);
                    successful++;
                } catch (Exception e) {
                    failed++;
                    errors.add("Row " + (row.getRowNum() + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new BusinessException("Failed to process Excel file: " + e.getMessage(), "IMPORT_FAILED");
        }

        return ImportDto.ImportResult.builder()
                .totalRows(totalRows)
                .successfulImports(successful)
                .failedImports(failed)
                .errors(errors)
                .build();
    }

    private void processRow(Row row) {
        String ticketNumber = getCellAsString(row.getCell(0));
        String pnr = getCellAsString(row.getCell(1));
        String passengerName = getCellAsString(row.getCell(2));
        String airlineCode = getCellAsString(row.getCell(3));
        String agentCode = getCellAsString(row.getCell(4));
        
        LocalDate issueDate = null;
        Cell dateCell = row.getCell(5);
        if (dateCell != null) {
            if (dateCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dateCell)) {
                issueDate = dateCell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            } else {
                try {
                    issueDate = LocalDate.parse(getCellAsString(dateCell));
                } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid date format in column 5");
                }
            }
        }

        BigDecimal baseFare = getCellAsBigDecimal(row.getCell(6));
        BigDecimal tax = getCellAsBigDecimal(row.getCell(7));

        if (ticketNumber == null || ticketNumber.isBlank()) {
            throw new IllegalArgumentException("Ticket number is missing");
        }
        if (issueDate == null) {
            throw new IllegalArgumentException("Issue date is missing");
        }

        // Lookup airline and agent
        Optional<Airline> airlineOpt = airlineCode != null && !airlineCode.isBlank() ? airlineRepository.findByCode(airlineCode) : Optional.empty();
        Optional<Agent> agentOpt = agentCode != null && !agentCode.isBlank() ? agentRepository.findByCode(agentCode) : Optional.empty();

        TransactionDto.CreateTransactionRequest request = TransactionDto.CreateTransactionRequest.builder()
                .ticketNumber(ticketNumber)
                .pnr(pnr)
                .passengerName(passengerName)
                .airlineId(airlineOpt.map(Airline::getId).orElse(null))
                .agentId(agentOpt.map(Agent::getId).orElse(null))
                .issueDate(issueDate)
                .baseFare(baseFare)
                .tax(tax)
                .build();

        transactionService.createTransaction(request);
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private String getCellAsString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getDateCellValue().toString();
                } else {
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private BigDecimal getCellAsBigDecimal(Cell cell) {
        if (cell == null) return BigDecimal.ZERO;
        return switch (cell.getCellType()) {
            case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue());
            case STRING -> {
                try {
                    yield new BigDecimal(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    yield BigDecimal.ZERO;
                }
            }
            default -> BigDecimal.ZERO;
        };
    }
}
