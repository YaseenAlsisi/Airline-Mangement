package com.ldi.aams.notification;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.common.dto.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDto.NotificationResponse>>> getNotifications(
            Authentication authentication,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.of(notificationService.getUserNotifications(authentication.getName(), pageable))
        ));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<NotificationDto.UnreadCountResponse>> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getUnreadCount(authentication.getName())
        ));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id, Authentication authentication) {
        notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
