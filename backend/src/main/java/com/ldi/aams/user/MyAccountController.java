package com.ldi.aams.user;

import com.ldi.aams.common.dto.ApiResponse;
import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import com.ldi.aams.user.internal.User;
import com.ldi.aams.user.internal.UserMapper;
import com.ldi.aams.user.internal.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/my-account")
@RequiredArgsConstructor
public class MyAccountController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> getMyProfile(Principal principal) {
        User user = getUserFromPrincipal(principal);
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(user)));
    }

    @PutMapping
    @Transactional
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> updateMyProfile(Principal principal, @Valid @RequestBody UserDto.UpdateUserRequest request) {
        User user = getUserFromPrincipal(principal);

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists", "EMAIL_EXISTS");
        }

        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());

        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(userRepository.save(user))));
    }

    @PutMapping("/password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        User user = getUserFromPrincipal(principal);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BusinessException("Invalid old password", "INVALID_PASSWORD");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private User getUserFromPrincipal(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", principal.getName()));
    }

    @lombok.Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }
}
