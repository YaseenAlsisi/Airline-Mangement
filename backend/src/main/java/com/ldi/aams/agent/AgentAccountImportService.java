package com.ldi.aams.agent;

import com.ldi.aams.agent.internal.Agent;
import com.ldi.aams.agent.internal.AgentRepository;
import com.ldi.aams.agent.internal.balance.AgentImportBatch;
import com.ldi.aams.agent.internal.balance.AgentImportBatchRepository;
import com.ldi.aams.agent.internal.balance.AgentImportResult;
import com.ldi.aams.agent.internal.balance.AgentTransaction;
import com.ldi.aams.agent.internal.balance.AgentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentAccountImportService {

    private final AgentTransactionRepository transactionRepository;
    private final AgentImportBatchRepository batchRepository;
    private final AgentRepository agentRepository;

    public AgentImportResult importFromStream(InputStream inputStream, String filename, UUID importerId) {
        try {
            Workbook workbook = WorkbookFactory.create(inputStream);
            
            AgentImportBatch batch = AgentImportBatch.builder()
                    .originalFilename(filename)
                    .importedBy(importerId)
                    .status("COMPLETED")
                    .build();
            batch = batchRepository.save(batch);

            int totalAgents = 0;
            int totalTransactions = 0;
            int totalPassengers = 0;
            int totalPayments = 0;

            // Optional: check for bad debts sheet (مديونيات معدومه) to categorize agents.
            // For now, defaulting all new agents to NORMAL and we can handle bad debts later.

            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                String sheetName = sheet.getSheetName().trim();

                // Skip main and non-agent sheets
                if (sheetName.equals("الرئيسيه") || 
                    sheetName.equals("نموذج (2)") || 
                    sheetName.equals("نموذج (3)") ||
                    sheetName.equals("حساب التحالف") || 
                    sheetName.equals("خزنه احمد سامح") || 
                    sheetName.equals("مدفوعات التحالف") ||
                    sheetName.equals("رحليستا")) {
                    continue;
                }

                log.debug("Processing agent sheet: {}", sheetName);
                
                // Agent identification
                Agent agent = matchOrCreateAgent(sheetName, batch.getId());
                boolean hasData = false;
                List<AgentTransaction> batchTransactions = new ArrayList<>();
                
                Row headerRow = sheet.getRow(0);
                int idxDUsd = 16, idxCUsd = 17, idxDEgp = 18, idxCEgp = 19;
                if (headerRow != null) {
                    for (int c = 0; c < Math.max(25, headerRow.getLastCellNum()); c++) {
                        String h = getStringValue(headerRow, c);
                        if (h == null) continue;
                        if (h.contains("مدين دولار")) idxDUsd = c;
                        else if (h.contains("دائن دولار")) idxCUsd = c;
                        else if (h.contains("مدين مصري") || h.contains("مدين جنيه")) idxDEgp = c;
                        else if (h.contains("دائن مصري") || h.contains("دائن جنيه")) idxCEgp = c;
                    }
                }

                for (int r = 1; r <= sheet.getLastRowNum(); r++) { // skip header at r=0
                    Row row = sheet.getRow(r);
                    if (row == null) continue;

                    String transactionType = classifyRow(row, idxDUsd, idxCUsd, idxDEgp, idxCEgp);
                    if (transactionType.equals("EMPTY") || transactionType.equals("SUMMARY") || transactionType.equals("SECTION_HEADER") || transactionType.equals("UNKNOWN")) {
                        continue;
                    }

                    AgentTransaction transaction = AgentTransaction.builder()
                            .agent(agent)
                            .importBatchId(batch.getId())
                            .transactionType(transactionType)
                            .sourceSheetName(sheetName)
                            .sourceRowNumber(r)
                            .rawColumnA(getStringValue(row, 0))
                            .build();

                    populateTransaction(transaction, row, transactionType, idxDUsd, idxCUsd, idxDEgp, idxCEgp);

                    batchTransactions.add(transaction);
                    hasData = true;
                    totalTransactions++;
                    
                    if (transactionType.equals("PASSENGER")) totalPassengers++;
                    else if (transactionType.equals("PAYMENT")) totalPayments++;

                    if (batchTransactions.size() >= 1000) {
                        transactionRepository.saveAll(batchTransactions);
                        batchTransactions.clear();
                    }
                }
                
                if (!batchTransactions.isEmpty()) {
                    transactionRepository.saveAll(batchTransactions);
                    batchTransactions.clear();
                }
                
                if (hasData) {
                    totalAgents++;
                }
            }

            batch.setTotalAgents(totalAgents);
            batch.setTotalTransactions(totalTransactions);
            batch.setTotalPassengers(totalPassengers);
            batch.setTotalPayments(totalPayments);
            batchRepository.save(batch);

            workbook.close();

            return AgentImportResult.builder()
                    .batchId(batch.getId())
                    .totalAgents(totalAgents)
                    .totalTransactions(totalTransactions)
                    .totalPassengers(totalPassengers)
                    .totalPayments(totalPayments)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error importing agent accounts workbook", e);
            throw new RuntimeException("Failed to import agent accounts workbook", e);
        }
    }

    @Transactional
    public void deleteImportData(UUID batchId) {
        transactionRepository.deleteByImportBatchId(batchId);
        
        // Soft delete agents that have NO manual transactions
        // Note: Not doing full soft delete logic here to keep it simple; 
        // Just keeping them but their balances will be 0. We can refine agent cleanup later.
        
        AgentImportBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        batch.setStatus("DELETED");
        batch.setDeletedAt(Instant.now());
        batchRepository.save(batch);
    }

    public AgentImportResult reimportFromStream(InputStream inputStream, String filename, UUID importerId) {
        batchRepository.findByStatus("COMPLETED").forEach(b -> deleteImportData(b.getId()));
        return importFromStream(inputStream, filename, importerId);
    }

    private Agent matchOrCreateAgent(String sheetName, UUID batchId) {
        // Find existing by sourceSheetName or exact name
        List<Agent> agents = agentRepository.findAll(); // Optimization: use specific query if large
        for (Agent a : agents) {
            if (sheetName.equals(a.getSourceSheetName()) || sheetName.equals(a.getName())) {
                if (a.getSourceSheetName() == null) {
                    a.setSourceSheetName(sheetName);
                    agentRepository.save(a);
                }
                return a;
            }
        }

        // Generate a new code
        long count = agentRepository.count();
        String code = "AGT-IMP-" + (count + 1);

        Agent newAgent = Agent.builder()
                .name(sheetName)
                .code(code)
                .sourceSheetName(sheetName)
                .importBatchId(batchId)
                .status("ACTIVE")
                .debtCategory("NORMAL")
                .currency("USD")
                .build();
        return agentRepository.save(newAgent);
    }

    private String classifyRow(Row row, int idxDUsd, int idxCUsd, int idxDEgp, int idxCEgp) {
        String colA = getStringValue(row, 0);
        
        if (isRowEmpty(row)) return "EMPTY";
        
        if (colA != null && colA.contains("ما قبله")) return "OPENING_BALANCE";
        
        String colI = getStringValue(row, 8);
        if ((colI != null && (colI.contains("اجمالي المديونيه") || colI.contains("الرئيسيه"))) ||
            (colA != null && (colA.contains("اجمالي المديونيه") || colA.contains("الرئيسيه")))) {
            return "SUMMARY";
        }
        
        boolean hasTravelData = hasAnyValue(row, 1, 15);
        boolean hasFinancials = false;
        int[] finIndices = {idxDUsd, idxCUsd, idxDEgp, idxCEgp};
        for (int idx : finIndices) {
            if (idx >= 0) {
                BigDecimal val = getNumericValue(row, idx);
                if (val.compareTo(BigDecimal.ZERO) != 0) {
                    hasFinancials = true;
                    break;
                }
            }
        }
        
        if (!hasTravelData && hasFinancials) {
            return "PAYMENT";
        }
        if (colA != null && !colA.isEmpty() && !hasTravelData && !hasFinancials) {
            return "SECTION_HEADER";
        }
        if (hasTravelData) {
            return "PASSENGER";
        }
        
        return "UNKNOWN";
    }

    private String truncate(String val, int maxLen) {
        if (val == null) return null;
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }

    private void populateTransaction(AgentTransaction txn, Row row, String type, int idxDUsd, int idxCUsd, int idxDEgp, int idxCEgp) {
        txn.setDebitUsd(getNumericValue(row, idxDUsd));
        txn.setCreditUsd(getNumericValue(row, idxCUsd));
        txn.setDebitEgp(getNumericValue(row, idxDEgp));
        txn.setCreditEgp(getNumericValue(row, idxCEgp));

        if (type.equals("PASSENGER")) {
            txn.setPassengerName(truncate(getStringValue(row, 0), 255));
            txn.setBirthDate(getDateValue(row, 1));
            txn.setNationalId(truncate(getStringValue(row, 2), 50));
            txn.setPassportNumber(truncate(getStringValue(row, 3), 50));
            txn.setDeparturePort(truncate(getStringValue(row, 4), 100));
            txn.setDestination(truncate(getStringValue(row, 5), 100));
            txn.setAirline(truncate(getStringValue(row, 6), 100));
            txn.setDepartureDate(getDateValue(row, 7));
            txn.setDepartureTime(getTimeValue(row, 8));
            // col 9 is agentName, handled by sheet mapping
            txn.setInvestmentSupplier(truncate(getStringValue(row, 10), 255));
            txn.setPassengerCategory(truncate(getStringValue(row, 11), 50));
            txn.setServiceType(truncate(getStringValue(row, 12), 100));
            txn.setNote(truncate(getStringValue(row, 13), 1000));
            txn.setNote2(truncate(getStringValue(row, 14), 1000));
            txn.setNote3(truncate(getStringValue(row, 15), 1000));
        } else if (type.equals("PAYMENT") || type.equals("OPENING_BALANCE")) {
            txn.setPaymentDescription(truncate(getStringValue(row, 0), 255));
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < 20; i++) {
            if (getStringValue(row, i) != null && !getStringValue(row, i).isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private boolean hasAnyValue(Row row, int startCol, int endCol) {
        for (int i = startCol; i <= endCol; i++) {
            String val = getStringValue(row, i);
            if (val != null && !val.trim().isEmpty()) {
                return true;
            }
        }
        return false;
    }

    private boolean hasAnyFinancialValue(Row row, int startCol, int endCol) {
        for (int i = startCol; i <= endCol; i++) {
            BigDecimal val = getNumericValue(row, i);
            if (val.compareTo(BigDecimal.ZERO) != 0) {
                return true;
            }
        }
        return false;
    }

    private String getStringValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;
        DataFormatter formatter = new DataFormatter();
        String val = formatter.formatCellValue(cell).trim();
        return val.isEmpty() ? null : val;
    }

    private BigDecimal getNumericValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return BigDecimal.ZERO;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        if (cell.getCellType() == CellType.STRING) {
            try {
                String strVal = cell.getStringCellValue().replaceAll("[^\\d.-]", "");
                return strVal.isEmpty() ? BigDecimal.ZERO : new BigDecimal(strVal);
            } catch (Exception e) {
                return BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }

    private LocalDate getDateValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        String strVal = getStringValue(row, index);
        if (strVal == null) return null;
        try {
            return LocalDate.parse(strVal, DateTimeFormatter.ofPattern("dd/MM/yyyy")); // Adjust format if needed
        } catch (DateTimeParseException e) {
            return null; // or log a warning
        }
    }

    private LocalTime getTimeValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalTime();
        }
        String strVal = getStringValue(row, index);
        if (strVal == null) return null;
        try {
            return LocalTime.parse(strVal);
        } catch (DateTimeParseException e) {
            return null; // or log a warning
        }
    }
}
