package com.ldi.aams.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings/security")
@RequiredArgsConstructor
public class SecuritySettingsController {
    private final SecuritySettingsService securitySettingsService;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE')")
    public ResponseEntity<List<SecuritySettingDto>> getAllSettings() {
        return ResponseEntity.ok(securitySettingsService.getAllSettings());
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE')")
    public ResponseEntity<SecuritySettingDto> updateSetting(@PathVariable String key, @RequestBody String value) {
        return ResponseEntity.ok(securitySettingsService.updateSetting(key, value));
    }
}
