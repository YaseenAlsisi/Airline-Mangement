package com.ldi.aams.user;

import com.ldi.aams.common.exception.BusinessException;
import com.ldi.aams.common.exception.ResourceNotFoundException;
import com.ldi.aams.user.internal.Role;
import com.ldi.aams.user.internal.RoleRepository;
import com.ldi.aams.user.internal.User;
import com.ldi.aams.user.internal.UserMapper;
import com.ldi.aams.user.internal.UserRepository;
import com.ldi.aams.auth.internal.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public Page<UserDto.UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UserDto.UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDto.UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserDto.UserResponse createUser(UserDto.CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username already exists", "USER_EXISTS");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists", "EMAIL_EXISTS");
        }

        Set<Role> roles = request.getRoleIds().stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId)))
                .collect(Collectors.toSet());

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .roles(roles)
                .isActive(true)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDto.UserResponse updateUser(UUID id, UserDto.UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists", "EMAIL_EXISTS");
        }

        Set<Role> roles = request.getRoleIds().stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId)))
                .collect(Collectors.toSet());

        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRoles(roles);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDto.UserResponse updateUserStatus(UUID id, UserDto.UpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setActive(request.isActive());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void resetPassword(UUID id, UserDto.ResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserDto.UserResponse updateProfile(String username, UserDto.UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists", "EMAIL_EXISTS");
        }

        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String username, UserDto.ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Incorrect current password", "INCORRECT_PASSWORD");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        // Prevent deleting the initial admin user (username: admin)
        if ("admin".equals(user.getUsername())) {
            throw new BusinessException("Cannot delete the system administrator", "SYSTEM_USER");
        }

        refreshTokenRepository.deleteByUser(user);
        userRepository.delete(user);
    }
}
