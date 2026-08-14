package com.ldi.aams.user;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.common.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('USER_MANAGE')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<UserDto.UserResponse>>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(userService.getAllUsers(pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> createUser(@Valid @RequestBody UserDto.CreateUserRequest request) {
        return new ResponseEntity<>(ApiResponse.success(userService.createUser(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> updateUser(@PathVariable UUID id, @Valid @RequestBody UserDto.UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUser(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> updateUserStatus(@PathVariable UUID id, @Valid @RequestBody UserDto.UpdateUserStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserStatus(id, request)));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable UUID id, @Valid @RequestBody UserDto.ResetPasswordRequest request) {
        userService.resetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
