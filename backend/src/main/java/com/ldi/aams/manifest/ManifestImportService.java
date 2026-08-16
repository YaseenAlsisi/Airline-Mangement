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

import java.io.ByteArrayOutputStream;
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
    private final com.ldi.aams.pricelist.PriceListService priceListService;

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

            Set<String> processedKeys = new HashSet<>();
            for (Row row : sheet) {
                if (row.getRowNum() <= headerRow.getRowNum()) continue;

                if (isRowEmpty(row)) continue;

                String passportNumber = getStringValue(row, headerMap.get("passportNumber"));
                LocalDate departureDate = getDateValue(row, headerMap.get("departureDate"));
                String passengerName = getStringValue(row, headerMap.get("passengerName"));

                boolean isDuplicate = false;

                if (passportNumber != null && !passportNumber.isEmpty()) {
                    String uniqueKey = "PPT_" + passportNumber + "_" + departureDate;
                    if (processedKeys.contains(uniqueKey)) {
                        isDuplicate = true;
                    } else {
                        List<ManifestPassenger> existing = passengerRepository.findByPassportNumber(passportNumber);
                        for (ManifestPassenger ep : existing) {
                            if (Objects.equals(ep.getDepartureDate(), departureDate)) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) processedKeys.add(uniqueKey);
                    }
                }

                if (!isDuplicate && passengerName != null && !passengerName.isEmpty()) {
                    String uniqueKey = "NAME_" + passengerName + "_" + departureDate;
                    if (processedKeys.contains(uniqueKey)) {
                        isDuplicate = true;
                    } else {
                        List<ManifestPassenger> existing = passengerRepository.findByPassengerName(passengerName);
                        for (ManifestPassenger ep : existing) {
                            if (Objects.equals(ep.getDepartureDate(), departureDate)) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) processedKeys.add(uniqueKey);
                    }
                }

                if (isDuplicate) {
                    continue; // Skip because it already exists
                }

                totalRows++;

                ManifestPassenger passenger = new ManifestPassenger();
                passenger.setBatch(batch);
                passenger.setRowNumber(row.getRowNum() + 1);

                passenger.setPassengerName(passengerName);
                passenger.setBirthDate(getDateValue(row, headerMap.get("birthDate")));
                passenger.setNationalId(getStringValue(row, headerMap.get("nationalId")));
                passenger.setPassportNumber(passportNumber);
                passenger.setDeparturePort(getStringValue(row, headerMap.get("departurePort")));
                passenger.setDestination(getStringValue(row, headerMap.get("destination")));
                passenger.setFlightNumber(getStringValue(row, headerMap.get("flightNumber")));
                passenger.setDepartureDate(departureDate);
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

    private Agent matchOrCreateAgent(String rawName) {
        Map<String, Agent> agentCache = new HashMap<>();
        agentRepository.findAll().forEach(a -> agentCache.put(a.getName().trim().toLowerCase(), a));
        return matchOrCreateAgent(rawName, agentCache);
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

    @Transactional
    public void calculatePrices(UUID batchId) {
        ManifestImportBatch batch = getBatch(batchId);
        List<ManifestPassenger> passengers = passengerRepository.findByBatchId(batchId, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE, org.springframework.data.domain.Sort.by("rowNumber").ascending())).getContent();
        
        List<com.ldi.aams.pricelist.PriceListDto.PriceListResponse> allPriceLists = 
            priceListService.getAllPriceLists(org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

        for (ManifestPassenger p : passengers) {
            String pDep = normalizeArabicString(p.getDeparturePort());
            String pDest = normalizeArabicString(p.getDestination());
            String originalCat = normalizePassengerCategory(p.getPassengerCategory());
            String targetCat = originalCat;

            if ("CHILD".equals(originalCat) && p.getBirthDate() != null && p.getDepartureDate() != null) {
                int age = java.time.Period.between(p.getBirthDate(), p.getDepartureDate()).getYears();
                if (age <= 8) {
                    targetCat = "CHILD_UNDER_8";
                }
            }

            BigDecimal foundPrice = null;
            BigDecimal foundCommission = null;

            for (com.ldi.aams.pricelist.PriceListDto.PriceListResponse pl : allPriceLists) {
                if (pl.getAgentId() != null && p.getAgent() != null && !pl.getAgentId().equals(p.getAgent().getId())) {
                    continue;
                }
                for (com.ldi.aams.pricelist.PriceListDto.PricingGroupResponse group : pl.getGroups()) {
                    String gDep = normalizeArabicString(group.getDepartureAirport());
                    String gDest = normalizeArabicString(group.getDestination());
                    
                    if ((isMatch(pDep, gDep) && isMatch(pDest, gDest)) || 
                        (isMatch(pDep, gDest) && isMatch(pDest, gDep))) {
                        for (com.ldi.aams.pricelist.PriceListDto.PriceListEntryResponse entry : group.getEntries()) {
                            if (entry.getPassengerType() != null && entry.getPassengerType().name().equalsIgnoreCase(targetCat)) {
                                foundPrice = entry.getPrice();
                                foundCommission = entry.getCommission();
                                break;
                            }
                        }
                        if (foundPrice == null && !targetCat.equals(originalCat)) {
                            for (com.ldi.aams.pricelist.PriceListDto.PriceListEntryResponse entry : group.getEntries()) {
                                if (entry.getPassengerType() != null && entry.getPassengerType().name().equalsIgnoreCase(originalCat)) {
                                    foundPrice = entry.getPrice();
                                    foundCommission = entry.getCommission();
                                    break;
                                }
                            }
                        }
                    }
                    if (foundPrice != null) break;
                }
                if (foundPrice != null) break;
            }

            p.setRegularPrice(foundPrice);
            p.setCommission(foundCommission);
            if (foundPrice != null && foundCommission != null) {
                p.setTotalPrice(foundPrice.add(foundCommission));
            } else if (foundPrice != null) {
                p.setTotalPrice(foundPrice);
            } else {
                p.setTotalPrice(null);
            }
        }
        passengerRepository.saveAll(passengers);
    }

    private boolean isMatch(String s1, String s2) {
        if (s1 == null || s2 == null || s1.isEmpty() || s2.isEmpty()) return false;
        return s1.contains(s2) || s2.contains(s1);
    }

    private String normalizeArabicString(String input) {
        if (input == null) return "";
        return input
                .replaceAll("(?i)(مطار|ميناء|م\\.|الدولي|دولي|مدينة|محطة|منفذ)", "")
                .replace("ة", "ه")
                .replace("أ", "ا")
                .replace("إ", "ا")
                .replace("آ", "ا")
                .replace("ى", "ي")
                .replace("ؤ", "و")
                .replace("ئ", "ي")
                .replace("ء", "")
                .replaceAll("[\\s\\-_]+", "")
                .trim();
    }

    private String normalizePassengerCategory(String rawType) {
        if (rawType == null) return "";
        String type = rawType.trim().toUpperCase();
        switch (type) {
            case "ADULT":
            case "بالغ":
            case "بالغ - ADULT":
                return "ADULT";
            case "CHILD":
            case "طفل":
            case "اطفال":
            case "طفل - CHILD":
                return "CHILD";
            case "INFANT":
            case "رضيع":
            case "رضع":
            case "رضيع - INFANT":
                return "INFANT";
            case "LADIES":
            case "سيدات":
            case "سيدة":
            case "انثى":
            case "انثي":
            case "سيدة - LADIES":
                return "LADIES";
            case "CHILD_UNDER_8":
            case "طفل تحت 8 سنوات":
            case "طفل تحت 8":
            case "طفل تحت 8 سنوات - CHILD UNDER 8":
                return "CHILD_UNDER_8";
            default:
                return type;
        }
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ManifestPassenger> getRows(UUID batchId, org.springframework.data.domain.Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            int page = pageable.isPaged() ? pageable.getPageNumber() : 0;
            int size = pageable.isPaged() ? pageable.getPageSize() : Integer.MAX_VALUE;
            pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("rowNumber").ascending());
        }
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

        List<ManifestPassenger> passengers = passengerRepository.findByBatchId(batchId);
        
        // Use local cache for optimization during publish
        Map<String, Agent> agentCache = new HashMap<>();
        agentRepository.findAll().forEach(a -> agentCache.put(a.getName().trim().toLowerCase(), a));

        for (ManifestPassenger p : passengers) {
            if ("VALID".equals(p.getValidationStatus()) && p.getAgentNameRaw() != null && !p.getAgentNameRaw().isBlank()) {
                Agent agent = matchOrCreateAgent(p.getAgentNameRaw(), agentCache);
                p.setAgent(agent);
                passengerRepository.save(p);
            }
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

    @Transactional(readOnly = true)
    public byte[] exportToExcel(UUID batchId) {
        List<ManifestPassenger> passengers = passengerRepository.findByBatchId(
            batchId, 
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE, org.springframework.data.domain.Sort.by("rowNumber").ascending())
        ).getContent();

        try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            org.apache.poi.xssf.usermodel.XSSFSheet sheet = workbook.createSheet("Manifest Export");
            sheet.setRightToLeft(true);
            
            // Columns order: name, birthDate, passport, depPort, dest, flightNo, depDate, arrivalTime, agent, serviceType, category, price, commission, total
            String[] headers = {
                "الاسم", "تاريخ الميلاد", "رقم الجواز", "جهة المغادرة", "جهة الوصول", 
                "رقم الرحلة", "تاريخ المغادرة", "ميعاد الوصول", "الوكيل", "نوع الخدمة", "النوع",
                "السعر الأساسي", "العمولة", "الإجمالي"
            };

            // ---- Shared colors ----
            org.apache.poi.xssf.usermodel.DefaultIndexedColorMap colorMap = new org.apache.poi.xssf.usermodel.DefaultIndexedColorMap();
            org.apache.poi.xssf.usermodel.XSSFColor accentBkg = new org.apache.poi.xssf.usermodel.XSSFColor(new byte[]{(byte)218,(byte)234,(byte)255}, colorMap);
            org.apache.poi.xssf.usermodel.XSSFColor accentFont = new org.apache.poi.xssf.usermodel.XSSFColor(new byte[]{(byte)48,(byte)74,(byte)206}, colorMap);

            // ---- Header style ----
            org.apache.poi.xssf.usermodel.XSSFCellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.xssf.usermodel.XSSFFont headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontName("Cairo");
            headerFont.setFontHeightInPoints((short) 14);
            headerFont.setColor(accentFont);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(accentBkg);
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // ---- Data style ----
            org.apache.poi.xssf.usermodel.XSSFCellStyle dataStyle = workbook.createCellStyle();
            org.apache.poi.xssf.usermodel.XSSFFont dataFont = workbook.createFont();
            dataFont.setFontName("Cairo");
            dataFont.setFontHeightInPoints((short) 12);
            dataStyle.setFont(dataFont);
            dataStyle.setAlignment(HorizontalAlignment.CENTER);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // ---- Total style ----
            org.apache.poi.xssf.usermodel.XSSFCellStyle totalStyle = workbook.createCellStyle();
            org.apache.poi.xssf.usermodel.XSSFFont totalFont = workbook.createFont();
            totalFont.setBold(true);
            totalFont.setFontName("Cairo");
            totalFont.setFontHeightInPoints((short) 14);
            totalFont.setColor(accentFont);
            totalStyle.setFont(totalFont);
            totalStyle.setFillForegroundColor(accentBkg);
            totalStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalStyle.setAlignment(HorizontalAlignment.CENTER);
            totalStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // ---- Create header row ----
            org.apache.poi.xssf.usermodel.XSSFRow headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(30);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.xssf.usermodel.XSSFCell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }
            
            // ---- Data rows ----
            BigDecimal sumRegular = BigDecimal.ZERO;
            BigDecimal sumCommission = BigDecimal.ZERO;
            BigDecimal sumTotal = BigDecimal.ZERO;

            int rowIdx = 1;
            for (ManifestPassenger p : passengers) {
                org.apache.poi.xssf.usermodel.XSSFRow row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(25);
                
                org.apache.poi.xssf.usermodel.XSSFCell[] cells = new org.apache.poi.xssf.usermodel.XSSFCell[headers.length];
                for (int i = 0; i < headers.length; i++) {
                    cells[i] = row.createCell(i);
                    cells[i].setCellStyle(dataStyle);
                }

                cells[0].setCellValue(p.getPassengerName() != null ? p.getPassengerName() : "");
                cells[1].setCellValue(p.getBirthDate() != null ? p.getBirthDate().toString() : "");
                cells[2].setCellValue(p.getPassportNumber() != null ? p.getPassportNumber() : "");
                cells[3].setCellValue(p.getDeparturePort() != null ? p.getDeparturePort() : "");
                cells[4].setCellValue(p.getDestination() != null ? p.getDestination() : "");
                cells[5].setCellValue(p.getFlightNumber() != null ? p.getFlightNumber() : "");
                cells[6].setCellValue(p.getDepartureDate() != null ? p.getDepartureDate().toString() : "");
                
                String arrivalTimeStr = "";
                if (p.getArrivalTime() != null) {
                    arrivalTimeStr = p.getArrivalTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                }
                cells[7].setCellValue(arrivalTimeStr);
                
                cells[8].setCellValue(p.getAgentNameRaw() != null ? p.getAgentNameRaw() : "");
                cells[9].setCellValue(p.getServiceType() != null ? p.getServiceType() : "");
                cells[10].setCellValue(p.getPassengerCategory() != null ? p.getPassengerCategory() : "");

                if (p.getRegularPrice() != null) {
                    cells[11].setCellValue(p.getRegularPrice().doubleValue());
                    sumRegular = sumRegular.add(p.getRegularPrice());
                } else {
                    cells[11].setCellValue("-");
                }
                
                if (p.getCommission() != null) {
                    cells[12].setCellValue(p.getCommission().doubleValue());
                    sumCommission = sumCommission.add(p.getCommission());
                } else {
                    cells[12].setCellValue("-");
                }
                
                if (p.getTotalPrice() != null) {
                    cells[13].setCellValue(p.getTotalPrice().doubleValue());
                    sumTotal = sumTotal.add(p.getTotalPrice());
                } else {
                    cells[13].setCellValue("-");
                }
            }

            // ---- Total row ----
            org.apache.poi.xssf.usermodel.XSSFRow totalRow = sheet.createRow(rowIdx);
            totalRow.setHeightInPoints(30);
            for (int i = 0; i < headers.length; i++) {
                totalRow.createCell(i).setCellStyle(totalStyle);
            }
            totalRow.getCell(0).setCellValue("المجموع");
            totalRow.getCell(11).setCellValue(sumRegular.doubleValue());
            totalRow.getCell(12).setCellValue(sumCommission.doubleValue());
            totalRow.getCell(13).setCellValue(sumTotal.doubleValue());
            
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to export excel", e);
            throw new RuntimeException("Failed to export Excel", e);
        }
    }
}



