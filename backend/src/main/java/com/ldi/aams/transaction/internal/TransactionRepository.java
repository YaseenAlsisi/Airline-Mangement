package com.ldi.aams.transaction.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Optional<Transaction> findByTicketNumber(String ticketNumber);
    boolean existsByTicketNumber(String ticketNumber);
    
    @Query("SELECT t.ticketNumber FROM Transaction t WHERE t.ticketNumber IN :ticketNumbers")
    Set<String> findExistingTicketNumbers(@Param("ticketNumbers") Set<String> ticketNumbers);
}
