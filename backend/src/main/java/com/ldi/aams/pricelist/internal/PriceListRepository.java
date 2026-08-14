package com.ldi.aams.pricelist.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PriceListRepository extends JpaRepository<PriceList, UUID> {
    Optional<PriceList> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT p FROM PriceList p WHERE p.status = 'ACTIVE' " +
           "AND (p.agentId = :agentId OR p.agentId IS NULL) " +
           "AND (p.airlineId = :airlineId OR p.airlineId IS NULL) " +
           "AND (p.validFrom IS NULL OR p.validFrom <= :issueDate) " +
           "AND (p.validTo IS NULL OR p.validTo >= :issueDate)")
    List<PriceList> findApplicablePriceLists(@Param("agentId") UUID agentId, 
                                             @Param("airlineId") UUID airlineId, 
                                             @Param("issueDate") LocalDate issueDate);
}
