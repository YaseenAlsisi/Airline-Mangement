package com.ldi.aams.notification;

import com.ldi.aams.notification.internal.Notification;
import com.ldi.aams.notification.internal.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<NotificationDto.NotificationResponse> getUserNotifications(String username, Pageable pageable) {
        return notificationRepository.findByRecipientUsername(username, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public NotificationDto.UnreadCountResponse getUnreadCount(String username) {
        return new NotificationDto.UnreadCountResponse(
                notificationRepository.countByRecipientUsernameAndIsReadFalse(username)
        );
    }

    @Transactional
    public void markAsRead(UUID id, String username) {
        notificationRepository.findById(id).ifPresent(notification -> {
            if (notification.getRecipientUsername().equals(username)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    @Transactional
    public void markAllAsRead(String username) {
        // Find unread and mark all. For simplicity and performance with a large set, 
        // a custom query in repository is better, but this works for now or we can implement bulk update.
        // In a real scenario, use a custom @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientUsername = :username")
        notificationRepository.findByRecipientUsername(username, Pageable.unpaged())
                .stream()
                .filter(n -> !n.isRead())
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    @Transactional
    public void createNotification(String recipient, String sender, String type, String message, UUID referenceId) {
        if (recipient.equals(sender)) {
            return; // Don't notify yourself
        }
        Notification notification = Notification.builder()
                .recipientUsername(recipient)
                .senderUsername(sender)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationDto.NotificationResponse toResponse(Notification notification) {
        return NotificationDto.NotificationResponse.builder()
                .id(notification.getId())
                .recipientUsername(notification.getRecipientUsername())
                .senderUsername(notification.getSenderUsername())
                .type(notification.getType())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
