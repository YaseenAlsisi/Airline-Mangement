package com.ldi.aams.settings;

import com.ldi.aams.settings.internal.SystemSetting;
import com.ldi.aams.settings.internal.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {
    private final SystemSettingRepository systemSettingRepository;

    public List<SystemSettingDto> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SystemSettingDto getSettingByKey(String key) {
        return systemSettingRepository.findByKey(key)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Setting not found with key: " + key));
    }

    @Transactional
    public SystemSettingDto updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElseGet(() -> SystemSetting.builder().key(key).build());
        
        setting.setValue(value);
        return mapToDto(systemSettingRepository.save(setting));
    }

    private SystemSettingDto mapToDto(SystemSetting entity) {
        return SystemSettingDto.builder()
                .id(entity.getId())
                .key(entity.getKey())
                .value(entity.getValue())
                .description(entity.getDescription())
                .build();
    }
}
