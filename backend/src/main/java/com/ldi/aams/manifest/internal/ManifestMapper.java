package com.ldi.aams.manifest.internal;

import com.ldi.aams.manifest.ManifestDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ManifestMapper {

    public ManifestDto.BatchResponse toBatchResponse(ManifestImportBatch batch) {
        if (batch == null) return null;
        return ManifestDto.BatchResponse.builder()
                .id(batch.getId())
                .originalFilename(batch.getOriginalFilename())
                .status(batch.getStatus())
                .totalRows(batch.getTotalRows())
                .validRows(batch.getValidRows())
                .invalidRows(batch.getInvalidRows())
                .publishedAt(batch.getPublishedAt())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();
    }

    public ManifestDto.PassengerRowResponse toPassengerRowResponse(ManifestPassenger row) {
        if (row == null) return null;
        return ManifestDto.PassengerRowResponse.builder()
                .id(row.getId())
                .batchId(row.getBatch().getId())
                .rowNumber(row.getRowNumber())
                .passengerName(row.getPassengerName())
                .birthDate(row.getBirthDate())
                .nationalId(row.getNationalId())
                .passportNumber(row.getPassportNumber())
                .departurePort(row.getDeparturePort())
                .destination(row.getDestination())
                .flightNumber(row.getFlightNumber())
                .departureDate(row.getDepartureDate())
                .arrivalTime(row.getArrivalTime())
                .agentId(row.getAgent() != null ? row.getAgent().getId() : null)
                .agentNameRaw(row.getAgentNameRaw())
                .investmentSupplier(row.getInvestmentSupplier())
                .serviceType(row.getServiceType())
                .passengerCategory(row.getPassengerCategory())
                .note2(row.getNote2())
                .note3(row.getNote3())
                .note4(row.getNote4())
                .debitUsd(row.getDebitUsd())
                .creditUsd(row.getCreditUsd())
                .debitEgp(row.getDebitEgp())
                .creditEgp(row.getCreditEgp())
                .creditEgpDate(row.getCreditEgpDate())
                .regularPrice(row.getRegularPrice())
                .commission(row.getCommission())
                .totalPrice(row.getTotalPrice())
                .validationStatus(row.getValidationStatus())
                .validationErrors(row.getValidationErrors())
                .build();
    }

    public ManifestDto.BatchPreviewResponse toBatchPreviewResponse(ManifestImportBatch batch, List<ManifestPassenger> rows) {
        if (batch == null) return null;
        return ManifestDto.BatchPreviewResponse.builder()
                .id(batch.getId())
                .status(batch.getStatus())
                .totalRows(batch.getTotalRows())
                .validRows(batch.getValidRows())
                .invalidRows(batch.getInvalidRows())
                .rows(rows.stream().map(this::toPassengerRowResponse).collect(Collectors.toList()))
                .build();
    }
}
