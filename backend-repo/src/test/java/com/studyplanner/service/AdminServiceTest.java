package com.studyplanner.service;

import com.studyplanner.dto.request.CreateUserRequest;
import com.studyplanner.dto.response.UserResponse;
import com.studyplanner.entity.User;
import com.studyplanner.enums.Role;
import com.studyplanner.exception.BadRequestException;
import com.studyplanner.exception.ResourceNotFoundException;
import com.studyplanner.repository.UserRepository;
import com.studyplanner.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DisplayName("AdminService Unit Tests")
public class AdminServiceTest {

    private AdminServiceImpl adminService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        adminService = new AdminServiceImpl(
            userRepository, null, null, null, null, passwordEncoder,
            null, null, null, null, null
        );
    }

    @Test
    @DisplayName("Should create user successfully")
    void testCreateUserSuccess() {
        CreateUserRequest request = new CreateUserRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        User user = User.builder()
            .id(1L)
            .name("Test User")
            .email("test@example.com")
            .role(Role.USER)
            .isActive(true)
            .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponse response = adminService.createUser(request);

        assertNotNull(response);
        assertEquals("Test User", response.getName());
        assertEquals("test@example.com", response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void testCreateUserWithDuplicateEmail() {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("duplicate@example.com");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> adminService.createUser(request));
    }

    @Test
    @DisplayName("Should disable user successfully")
    void testDisableUserSuccess() {
        User user = User.builder()
            .id(1L)
            .name("User")
            .role(Role.USER)
            .isDisabled(false)
            .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        adminService.disableUser(1L, "Test reason");

        verify(userRepository, times(1)).save(any(User.class));
        assertTrue(user.getIsDisabled());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testDisableUserNotFound() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> adminService.disableUser(1L, "reason"));
    }

    @Test
    @DisplayName("Should change user role successfully")
    void testChangeUserRoleSuccess() {
        User user = User.builder()
            .id(1L)
            .name("User")
            .role(Role.USER)
            .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserResponse response = adminService.changeUserRole(1L, Role.ADMIN);

        assertNotNull(response);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should delete user permanently")
    void testDeleteUserSuccess() {
        User user = User.builder()
            .id(1L)
            .name("User")
            .role(Role.USER)
            .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        adminService.deleteUserPermanently(1L);

        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting admin user")
    void testDeleteAdminUserFails() {
        User user = User.builder()
            .id(1L)
            .role(Role.ADMIN)
            .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> adminService.deleteUserPermanently(1L));
    }
}
