package com.ldi.aams.settings;

import com.ldi.aams.settings.internal.NotificationPreference;
import com.ldi.aams.settings.internal.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationSettingsService {
    private final NotificationPreferenceRepository notificationPreferenceRepository;

    public List<NotificationPreferenceDto> getPreferencesForUser(UUID userId) {
        return notificationPreferenceRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationPreferenceDto updatePreference(UUID userId, String key, String value) {
        NotificationPreference pref = notificationPreferenceRepository.findByUserIdAndKey(userId, key)
                .orElseGet(() -> NotificationPreference.builder().userId(userId).key(key).build());
        
        pref.setValue(value);
        return mapToDto(notificationPreferenceRepository.save(pref));
    }

    private NotificationPreferenceDto mapToDto(NotificationPreference entity) {
        return NotificationPreferenceDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .key(entity.getKey())
                .value(entity.getValue())
                .build();
    }
}
