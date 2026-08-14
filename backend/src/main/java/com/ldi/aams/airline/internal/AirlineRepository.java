package com.ldi.aams.airline.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AirlineRepository extends JpaRepository<Airline, UUID> {
    Optional<Airline> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByIataCode(String iataCode);
    boolean existsByNumericCode(String numericCode);
}
