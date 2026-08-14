package com.ldi.aams.user.internal;

import com.ldi.aams.user.RoleDto;
import com.ldi.aams.user.UserDto;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto.UserResponse toResponse(User user) {
        return UserDto.UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .isActive(user.isActive())
                .roles(user.getRoles().stream()
                        .map(this::toRoleResponse)
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }

    public RoleDto.RoleResponse toRoleResponse(Role role) {
        return RoleDto.RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.isSystem())
                .permissions(role.getPermissions().stream()
                        .map(this::toPermissionResponse)
                        .collect(Collectors.toSet()))
                .build();
    }

    public RoleDto.PermissionResponse toPermissionResponse(Permission permission) {
        return RoleDto.PermissionResponse.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .description(permission.getDescription())
                .module(permission.getModule())
                .build();
    }
}
