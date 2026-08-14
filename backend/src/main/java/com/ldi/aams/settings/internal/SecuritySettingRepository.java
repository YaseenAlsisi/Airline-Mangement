package com.ldi.aams.settings.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecuritySettingRepository extends JpaRepository<SecuritySetting, UUID> {
    Optional<SecuritySetting> findByKey(String key);
}
