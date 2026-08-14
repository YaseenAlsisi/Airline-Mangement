package com.ldi.aams.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings/notifications")
@RequiredArgsConstructor
public class NotificationSettingsController {
    private final NotificationSettingsService notificationSettingsService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or #userId == authentication.principal.id")
    public ResponseEntity<List<NotificationPreferenceDto>> getPreferences(@PathVariable UUID userId) {
        return ResponseEntity.ok(notificationSettingsService.getPreferencesForUser(userId));
    }

    @PutMapping("/{userId}/{key}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or #userId == authentication.principal.id")
    public ResponseEntity<NotificationPreferenceDto> updatePreference(
            @PathVariable UUID userId,
            @PathVariable String key,
            @RequestBody String value) {
        return ResponseEntity.ok(notificationSettingsService.updatePreference(userId, key, value));
    }
}
