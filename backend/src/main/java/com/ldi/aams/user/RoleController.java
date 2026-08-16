package com.ldi.aams.user;

import com.ldi.aams.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_MANAGE')")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleDto.RoleResponse>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success(roleService.getAllRoles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleDto.RoleResponse>> getRoleById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getRoleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleDto.RoleResponse>> createRole(@Valid @RequestBody RoleDto.CreateRoleRequest request) {
        return new ResponseEntity<>(ApiResponse.success(roleService.createRole(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleDto.RoleResponse>> updateRole(@PathVariable UUID id, @Valid @RequestBody RoleDto.UpdateRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(roleService.updateRole(id, request)));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<ApiResponse<RoleDto.RoleResponse>> assignPermissions(@PathVariable UUID id, @Valid @RequestBody RoleDto.AssignPermissionsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(roleService.assignPermissions(id, request)));
    }

    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<List<RoleDto.PermissionResponse>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.success(roleService.getAllPermissions()));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
