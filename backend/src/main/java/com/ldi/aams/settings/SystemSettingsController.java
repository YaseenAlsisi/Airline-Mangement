package com.ldi.aams.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings/system")
@RequiredArgsConstructor
public class SystemSettingsController {
    private final SystemSettingsService systemSettingsService;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE') or hasAuthority('SYSTEM_VIEW')")
    public ResponseEntity<List<SystemSettingDto>> getAllSettings() {
        return ResponseEntity.ok(systemSettingsService.getAllSettings());
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAuthority('SETTINGS_MANAGE')")
    public ResponseEntity<SystemSettingDto> updateSetting(@PathVariable String key, @RequestBody String value) {
        return ResponseEntity.ok(systemSettingsService.updateSetting(key, value));
    }
}
