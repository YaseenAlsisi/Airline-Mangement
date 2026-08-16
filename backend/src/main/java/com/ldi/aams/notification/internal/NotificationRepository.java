package com.ldi.aams.notification.internal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByRecipientUsername(String recipientUsername, Pageable pageable);
    long countByRecipientUsernameAndIsReadFalse(String recipientUsername);
}
