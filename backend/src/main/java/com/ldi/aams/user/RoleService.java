package com.ldi.aams.user;

import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import com.ldi.aams.user.internal.Permission;
import com.ldi.aams.user.internal.PermissionRepository;
import com.ldi.aams.user.internal.Role;
import com.ldi.aams.user.internal.RoleRepository;
import com.ldi.aams.user.internal.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<RoleDto.RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(userMapper::toRoleResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDto.RoleResponse getRoleById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return userMapper.toRoleResponse(role);
    }

    @Transactional
    public RoleDto.RoleResponse createRole(RoleDto.CreateRoleRequest request) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new BusinessException("Role name already exists", "ROLE_EXISTS");
        }

        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isSystem(false)
                .build();

        return userMapper.toRoleResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleDto.RoleResponse updateRole(UUID id, RoleDto.UpdateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (role.isSystem()) {
            throw new BusinessException("System roles cannot be modified", "SYSTEM_ROLE");
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());

        return userMapper.toRoleResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleDto.RoleResponse assignPermissions(UUID id, RoleDto.AssignPermissionsRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (role.isSystem()) {
            throw new BusinessException("System roles cannot be modified", "SYSTEM_ROLE");
        }

        Set<Permission> permissions = request.getPermissionIds().stream()
                .map(permId -> permissionRepository.findById(permId)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", permId)))
                .collect(Collectors.toSet());

        role.setPermissions(permissions);

        return userMapper.toRoleResponse(roleRepository.save(role));
    }

    @Transactional(readOnly = true)
    public List<RoleDto.PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(userMapper::toPermissionResponse)
                .collect(Collectors.toList());
    }
}
