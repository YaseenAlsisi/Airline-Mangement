package com.ldi.aams.manifest;

import com.ldi.aams.agent.internal.Agent;
import com.ldi.aams.agent.internal.AgentRepository;
import com.ldi.aams.manifest.internal.ManifestImportBatch;
import com.ldi.aams.manifest.internal.ManifestImportBatchRepository;
import com.ldi.aams.manifest.internal.ManifestPassenger;
import com.ldi.aams.manifest.internal.ManifestPassengerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManifestImportService {

    private final ManifestImportBatchRepository batchRepository;
    private final ManifestPassengerRepository passengerRepository;
    private final AgentRepository agentRepository;

    @Transactional
    public ManifestImportBatch previewManifestImport(MultipartFile file, UUID uploaderId) throws Exception {
        ManifestImportBatch batch = ManifestImportBatch.builder()
                .originalFilename(file.getOriginalFilename())
                .status("DRAFT")
                .uploadedBy(uploaderId)
                .build();
        batch = batchRepository.save(batch);

        int totalRows = 0;
        int validRows = 0;
        int invalidRows = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            Row headerRow = null;
            for (Row r : sheet) {
                if (r != null && r.getCell(0) != null && !r.getCell(0).toString().trim().isEmpty()) {
                    headerRow = r;
                    break;
                }
            }

            if (headerRow == null) {
                throw new IllegalArgumentException("Could not find header row in Excel file.");
            }

            Map<String, Integer> headerMap = new HashMap<>();
            int noteCount = 0;

            Map<String, Agent> agentCache = new HashMap<>();
            agentRepository.findAll().forEach(a -> agentCache.put(a.getName().trim().toLowerCase(), a));

            List<ManifestPassenger> passengersToSave = new ArrayList<>();

            for (Cell cell : headerRow) {
                if (cell == null) continue;
                String header = cell.toString().trim();
                if (header.isEmpty()) continue;

                // Normalize notes
                if (header.contains("ملاحظات")) {
                    noteCount++;
                    if (noteCount == 1) headerMap.put("passengerCategory", cell.getColumnIndex());
                    else if (noteCount == 2) headerMap.put("note2", cell.getColumnIndex());
                    else if (noteCount == 3) headerMap.put("note3", cell.getColumnIndex());
                    else if (noteCount == 4) headerMap.put("note4", cell.getColumnIndex());
                } else {
                    // Map other headers
                    if (header.equals("الاسم")) headerMap.put("passengerName", cell.getColumnIndex());
                    else if (header.equals("تاريخ الميلاد")) headerMap.put("birthDate", cell.getColumnIndex());
                    else if (header.equals("الرقم القومي")) headerMap.put("nationalId", cell.getColumnIndex());
                    else if (header.equals("رقم الجواز")) headerMap.put("passportNumber", cell.getColumnIndex());
                    else if (header.equals("المنفذ")) headerMap.put("departurePort", cell.getColumnIndex());
                    else if (header.contains("جهه المغادره") || header.contains("جهة المغادرة")) headerMap.put("destination", cell.getColumnIndex());
                    else if (header.equals("رقم الرحله") || header.equals("رقم الرحلة")) headerMap.put("flightNumber", cell.getColumnIndex());
                    else if (header.equals("تاريخ المغادرة") || header.equals("تاريخ المغادره")) headerMap.put("departureDate", cell.getColumnIndex());
                    else if (header.contains("ميعاد الوصول")) headerMap.put("arrivalTime", cell.getColumnIndex());
                    else if (header.equals("الوكيل")) headerMap.put("agentName", cell.getColumnIndex());
                    else if (header.equals("مورد الاستثمار")) headerMap.put("investmentSupplier", cell.getColumnIndex());
                    else if (header.contains("نوع الخدمه") || header.contains("نوع الخدمة")) headerMap.put("serviceType", cell.getColumnIndex());
                    else if (header.equals("النوع")) headerMap.put("passengerCategory", cell.getColumnIndex());
                    else if (header.equals("مدين دولار")) headerMap.put("debitUsd", cell.getColumnIndex());
                    else if (header.equals("دائن دولار")) headerMap.put("creditUsd", cell.getColumnIndex());
                    else if (header.equals("مدين مصري")) headerMap.put("debitEgp", cell.getColumnIndex());
                    else if (header.equals("دائن مصري")) headerMap.put("creditEgp", cell.getColumnIndex());
                }
            }

            for (Row row : sheet) {
                if (row.getRowNum() <= headerRow.getRowNum()) continue;

                if (isRowEmpty(row)) continue;

                totalRows++;

                ManifestPassenger passenger = new ManifestPassenger();
                passenger.setBatch(batch);
                passenger.setRowNumber(row.getRowNum() + 1);

                passenger.setPassengerName(getStringValue(row, headerMap.get("passengerName")));
                passenger.setBirthDate(getDateValue(row, headerMap.get("birthDate")));
                passenger.setNationalId(getStringValue(row, headerMap.get("nationalId")));
                passenger.setPassportNumber(getStringValue(row, headerMap.get("passportNumber")));
                passenger.setDeparturePort(getStringValue(row, headerMap.get("departurePort")));
                passenger.setDestination(getStringValue(row, headerMap.get("destination")));
                passenger.setFlightNumber(getStringValue(row, headerMap.get("flightNumber")));
                passenger.setDepartureDate(getDateValue(row, headerMap.get("departureDate")));
                passenger.setArrivalTime(getTimeValue(row, headerMap.get("arrivalTime")));
                passenger.setInvestmentSupplier(getStringValue(row, headerMap.get("investmentSupplier")));
                passenger.setServiceType(getStringValue(row, headerMap.get("serviceType")));
                passenger.setPassengerCategory(getStringValue(row, headerMap.get("passengerCategory")));
                passenger.setNote2(getStringValue(row, headerMap.get("note2")));
                passenger.setNote3(getStringValue(row, headerMap.get("note3")));
                passenger.setNote4(getStringValue(row, headerMap.get("note4")));

                passenger.setDebitUsd(getBigDecimalValue(row, headerMap.get("debitUsd")));
                passenger.setCreditUsd(getBigDecimalValue(row, headerMap.get("creditUsd")));
                passenger.setDebitEgp(getBigDecimalValue(row, headerMap.get("debitEgp")));
                passenger.setCreditEgp(getBigDecimalValue(row, headerMap.get("creditEgp")));

                String agentNameRaw = getStringValue(row, headerMap.get("agentName"));
                passenger.setAgentNameRaw(agentNameRaw);

                if (agentNameRaw != null && !agentNameRaw.trim().isEmpty()) {
                    Agent agent = matchOrCreateAgent(agentNameRaw.trim(), agentCache);
                    passenger.setAgent(agent);
                }

                // Validation
                List<String> errors = new ArrayList<>();
                if (passenger.getPassengerName() == null || passenger.getPassengerName().isEmpty()) {
                    errors.add("Passenger name is required");
                }
                if (passenger.getPassportNumber() == null || passenger.getPassportNumber().isEmpty()) {
                    errors.add("Passport number is required");
                }
                if (passenger.getAgentNameRaw() == null || passenger.getAgentNameRaw().isEmpty()) {
                    errors.add("Agent name is required");
                }
                if (passenger.getDepartureDate() == null) {
                    errors.add("Departure date is required");
                }

                if (errors.isEmpty()) {
                    passenger.setValidationStatus("VALID");
                    validRows++;
                } else {
                    passenger.setValidationStatus("ERROR");
                    passenger.setValidationErrors(String.join(", ", errors));
                    invalidRows++;
                }

                passengersToSave.add(passenger);
            }

            passengerRepository.saveAll(passengersToSave);
        }

        batch.setTotalRows(totalRows);
        batch.setValidRows(validRows);
        batch.setInvalidRows(invalidRows);
        return batchRepository.save(batch);
    }

    private Agent matchOrCreateAgent(String rawName, Map<String, Agent> agentCache) {
        String normalized = rawName.replaceAll("\\s+", " ").trim();
        String lower = normalized.toLowerCase();
        
        if (agentCache.containsKey(lower)) {
            return agentCache.get(lower);
        }

        // Not found, create
        Agent newAgent = new Agent();
        newAgent.setName(normalized);
        newAgent.setCode("AGT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        newAgent.setStatus("ACTIVE");
        newAgent.setCurrency("USD");
        Agent savedAgent = agentRepository.save(newAgent);
        agentCache.put(lower, savedAgent);
        return savedAgent;
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private String getStringValue(Row row, Integer colIndex) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            // Check if it's a number that should be a string (e.g., passport)
            long val = (long) cell.getNumericCellValue();
            return String.valueOf(val);
        }
        return cell.toString().trim();
    }

    private LocalDate getDateValue(Row row, Integer colIndex) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        String str = cell.toString().trim();
        if (str.isEmpty()) return null;
        try {
            return LocalDate.parse(str, DateTimeFormatter.ofPattern("yyyy-MM-dd")); // basic fallback
        } catch (Exception e) {
            return null;
        }
    }

    private LocalTime getTimeValue(Row row, Integer colIndex) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalTime();
        }
        String str = cell.toString().trim();
        if (str.isEmpty()) return null;
        try {
            if (str.length() == 5) {
                return LocalTime.parse(str, DateTimeFormatter.ofPattern("HH:mm"));
            }
            return LocalTime.parse(str, DateTimeFormatter.ofPattern("HH:mm:ss"));
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal getBigDecimalValue(Row row, Integer colIndex) {
        if (colIndex == null) return BigDecimal.ZERO;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return BigDecimal.ZERO;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        String str = cell.toString().trim();
        if (str.isEmpty()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(str);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    @Transactional(readOnly = true)
    public ManifestImportBatch getBatch(UUID batchId) {
        return batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ManifestImportBatch> getAllBatches(org.springframework.data.domain.Pageable pageable) {
        return batchRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ManifestPassenger> getRows(UUID batchId, org.springframework.data.domain.Pageable pageable) {
        return passengerRepository.findByBatchId(batchId, pageable);
    }

    @Transactional
    public ManifestPassenger updateRow(UUID batchId, UUID rowId, ManifestDto.PassengerRowUpdateRequest request) {
        ManifestPassenger passenger = passengerRepository.findById(rowId)
                .orElseThrow(() -> new IllegalArgumentException("Row not found"));
        if (!passenger.getBatch().getId().equals(batchId)) {
            throw new IllegalArgumentException("Row does not belong to this batch");
        }

        passenger.setPassengerName(request.getPassengerName());
        passenger.setBirthDate(request.getBirthDate());
        passenger.setNationalId(request.getNationalId());
        passenger.setPassportNumber(request.getPassportNumber());
        passenger.setDeparturePort(request.getDeparturePort());
        passenger.setDestination(request.getDestination());
        passenger.setFlightNumber(request.getFlightNumber());
        passenger.setDepartureDate(request.getDepartureDate());
        passenger.setArrivalTime(request.getArrivalTime());
        passenger.setInvestmentSupplier(request.getInvestmentSupplier());
        passenger.setServiceType(request.getServiceType());
        passenger.setPassengerCategory(request.getPassengerCategory());
        passenger.setNote2(request.getNote2());
        passenger.setNote3(request.getNote3());
        passenger.setNote4(request.getNote4());
        passenger.setDebitUsd(request.getDebitUsd() != null ? request.getDebitUsd() : BigDecimal.ZERO);
        passenger.setCreditUsd(request.getCreditUsd() != null ? request.getCreditUsd() : BigDecimal.ZERO);
        passenger.setDebitEgp(request.getDebitEgp() != null ? request.getDebitEgp() : BigDecimal.ZERO);
        passenger.setCreditEgp(request.getCreditEgp() != null ? request.getCreditEgp() : BigDecimal.ZERO);

        String agentNameRaw = request.getAgentNameRaw();
        passenger.setAgentNameRaw(agentNameRaw);
        if (agentNameRaw != null && !agentNameRaw.trim().isEmpty()) {
            Agent agent = matchOrCreateAgent(agentNameRaw.trim());
            passenger.setAgent(agent);
        } else {
            passenger.setAgent(null);
        }

        // Re-validate
        List<String> errors = new ArrayList<>();
        if (passenger.getPassengerName() == null || passenger.getPassengerName().isEmpty()) {
            errors.add("Passenger name is required");
        }
        if (passenger.getPassportNumber() == null || passenger.getPassportNumber().isEmpty()) {
            errors.add("Passport number is required");
        }
        if (passenger.getAgentNameRaw() == null || passenger.getAgentNameRaw().isEmpty()) {
            errors.add("Agent name is required");
        }
        if (passenger.getDepartureDate() == null) {
            errors.add("Departure date is required");
        }

        String oldStatus = passenger.getValidationStatus();
        if (errors.isEmpty()) {
            passenger.setValidationStatus("VALID");
            passenger.setValidationErrors(null);
            if ("ERROR".equals(oldStatus)) {
                ManifestImportBatch batch = passenger.getBatch();
                batch.setValidRows(batch.getValidRows() + 1);
                batch.setInvalidRows(batch.getInvalidRows() - 1);
                batchRepository.save(batch);
            }
        } else {
            passenger.setValidationStatus("ERROR");
            passenger.setValidationErrors(String.join(", ", errors));
            if ("VALID".equals(oldStatus)) {
                ManifestImportBatch batch = passenger.getBatch();
                batch.setValidRows(batch.getValidRows() - 1);
                batch.setInvalidRows(batch.getInvalidRows() + 1);
                batchRepository.save(batch);
            }
        }

        return passengerRepository.save(passenger);
    }

    @Transactional
    public void deleteRow(UUID batchId, UUID rowId) {
        ManifestPassenger passenger = passengerRepository.findById(rowId)
                .orElseThrow(() -> new IllegalArgumentException("Row not found"));
        if (!passenger.getBatch().getId().equals(batchId)) {
            throw new IllegalArgumentException("Row does not belong to this batch");
        }

        ManifestImportBatch batch = passenger.getBatch();
        batch.setTotalRows(Math.max(0, batch.getTotalRows() - 1));
        
        if ("VALID".equals(passenger.getValidationStatus())) {
            batch.setValidRows(Math.max(0, batch.getValidRows() - 1));
        } else if ("ERROR".equals(passenger.getValidationStatus())) {
            batch.setInvalidRows(Math.max(0, batch.getInvalidRows() - 1));
        }

        passengerRepository.delete(passenger);
        batchRepository.save(batch);
    }

    @Transactional
    public void deleteRows(UUID batchId, List<UUID> rowIds) {
        if (rowIds == null || rowIds.isEmpty()) return;

        List<ManifestPassenger> passengers = passengerRepository.findByIdInAndBatchId(rowIds, batchId);
        if (passengers.isEmpty()) return;

        ManifestImportBatch batch = getBatch(batchId);
        
        int removedValid = 0;
        int removedInvalid = 0;

        for (ManifestPassenger p : passengers) {
            if ("VALID".equals(p.getValidationStatus())) removedValid++;
            else if ("ERROR".equals(p.getValidationStatus())) removedInvalid++;
        }

        batch.setTotalRows(Math.max(0, batch.getTotalRows() - passengers.size()));
        batch.setValidRows(Math.max(0, batch.getValidRows() - removedValid));
        batch.setInvalidRows(Math.max(0, batch.getInvalidRows() - removedInvalid));

        passengerRepository.deleteAll(passengers);
        batchRepository.save(batch);
    }

    @Transactional
    public ManifestImportBatch publishBatch(UUID batchId) {
        ManifestImportBatch batch = getBatch(batchId);
        if (!"DRAFT".equals(batch.getStatus())) {
            throw new IllegalStateException("Only DRAFT batches can be published");
        }
        if (batch.getInvalidRows() > 0) {
            throw new IllegalStateException("Cannot publish batch with invalid rows. Fix them first.");
        }

        batch.setStatus("PUBLISHED");
        batch.setPublishedAt(Instant.now());
        return batchRepository.save(batch);
    }

    @Transactional
    public void deleteBatch(UUID batchId) {
        ManifestImportBatch batch = getBatch(batchId);
        passengerRepository.deleteByBatchId(batchId);
        batchRepository.delete(batch);
    }

    @Transactional
    public void deleteBatches(List<UUID> batchIds) {
        for (UUID id : batchIds) {
            deleteBatch(id);
        }
    }
}
