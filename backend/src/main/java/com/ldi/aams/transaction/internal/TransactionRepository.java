package com.ldi.aams.transaction.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Optional<Transaction> findByTicketNumber(String ticketNumber);
    boolean existsByTicketNumber(String ticketNumber);
}
