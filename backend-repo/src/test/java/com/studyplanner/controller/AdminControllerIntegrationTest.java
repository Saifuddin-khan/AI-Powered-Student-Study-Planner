package com.studyplanner.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyplanner.dto.request.CreateUserRequest;
import com.studyplanner.entity.User;
import com.studyplanner.enums.Role;
import com.studyplanner.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AdminController Integration Tests")
public class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        testUser = User.builder()
            .name("Test User")
            .email("test@example.com")
            .password("encodedPassword")
            .role(Role.USER)
            .isActive(true)
            .build();
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("Should get all users without authorization")
    void testGetAllUsersWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should get all users with admin authorization")
    @WithMockUser(roles = "ADMIN")
    void testGetAllUsersWithAdminAuth() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    @DisplayName("Should not allow USER role to access admin endpoints")
    @WithMockUser(roles = "USER")
    void testGetAllUsersWithUserAuth() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should get user by id")
    @WithMockUser(roles = "ADMIN")
    void testGetUserById() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/" + testUser.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.email", equalTo("test@example.com")));
    }

    @Test
    @DisplayName("Should return 404 for non-existent user")
    @WithMockUser(roles = "ADMIN")
    void testGetUserNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/9999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should create new user successfully")
    @WithMockUser(roles = "ADMIN")
    void testCreateUserSuccess() throws Exception {
        CreateUserRequest request = new CreateUserRequest();
        request.setName("New User");
        request.setEmail("newuser@example.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/v1/admin/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.email", equalTo("newuser@example.com")));
    }

    @Test
    @DisplayName("Should disable user successfully")
    @WithMockUser(roles = "ADMIN")
    void testDisableUserSuccess() throws Exception {
        mockMvc.perform(put("/api/v1/admin/users/" + testUser.getId() + "/disable?reason=Test"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should enable user successfully")
    @WithMockUser(roles = "ADMIN")
    void testEnableUserSuccess() throws Exception {
        mockMvc.perform(put("/api/v1/admin/users/" + testUser.getId() + "/enable"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should change user role")
    @WithMockUser(roles = "ADMIN")
    void testChangeUserRoleSuccess() throws Exception {
        mockMvc.perform(put("/api/v1/admin/users/" + testUser.getId() + "/role?newRole=ADMIN"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get analytics dashboard stats")
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardAnalytics() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/dashboard"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalUsers", greaterThanOrEqualTo(0)));
    }

    @Test
    @DisplayName("Should get content statistics")
    @WithMockUser(roles = "ADMIN")
    void testGetContentStatistics() throws Exception {
        mockMvc.perform(get("/api/v1/admin/content/statistics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data", notNullValue()));
    }
}
