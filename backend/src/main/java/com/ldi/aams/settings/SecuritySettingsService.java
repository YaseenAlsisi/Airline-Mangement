package com.ldi.aams.settings;

import com.ldi.aams.settings.internal.SecuritySetting;
import com.ldi.aams.settings.internal.SecuritySettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SecuritySettingsService {
    private final SecuritySettingRepository securitySettingRepository;

    public List<SecuritySettingDto> getAllSettings() {
        return securitySettingRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SecuritySettingDto updateSetting(String key, String value) {
        SecuritySetting setting = securitySettingRepository.findByKey(key)
                .orElseGet(() -> SecuritySetting.builder().key(key).build());
        
        setting.setValue(value);
        return mapToDto(securitySettingRepository.save(setting));
    }

    private SecuritySettingDto mapToDto(SecuritySetting entity) {
        return SecuritySettingDto.builder()
                .id(entity.getId())
                .key(entity.getKey())
                .value(entity.getValue())
                .description(entity.getDescription())
                .build();
    }
}
