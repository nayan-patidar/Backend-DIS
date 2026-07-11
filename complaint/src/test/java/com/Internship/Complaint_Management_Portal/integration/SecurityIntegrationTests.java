package com.Internship.Complaint_Management_Portal.integration;

import com.Internship.Complaint_Management_Portal.dto.ComplaintRequest;
import com.Internship.Complaint_Management_Portal.dto.LoginRequest;
import com.Internship.Complaint_Management_Portal.dto.RegisterRequest;
import com.Internship.Complaint_Management_Portal.model.Role;
import com.Internship.Complaint_Management_Portal.model.User;
import com.Internship.Complaint_Management_Portal.repository.ComplaintRepository;
import com.Internship.Complaint_Management_Portal.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        complaintRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // Accessing protected user route without authentication -> 401 Unauthorized
        mockMvc.perform(get("/api/complaints"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Authentication required")))
                .andExpect(jsonPath("$.path", is("/api/complaints")));

        // Accessing protected admin route without authentication -> 401 Unauthorized
        mockMvc.perform(get("/api/admin/complaints"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Authentication required")))
                .andExpect(jsonPath("$.path", is("/api/admin/complaints")));
    }

    @Test
    void testSuccessfulUserRegistrationAndLogin() throws Exception {
        // Register request
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("John Doe");
        registerRequest.setEmail("john.doe@example.com");
        registerRequest.setPassword("securePassword123");
        registerRequest.setRole("ROLE_USER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("User registered successfully!")));

        // Login request with correct credentials
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("john.doe@example.com");
        loginRequest.setPassword("securePassword123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("john.doe@example.com")))
                .andExpect(jsonPath("$.role", is("ROLE_USER")));
    }

    @Test
    void testInvalidUserLogin() throws Exception {
        // Create user directly
        User user = User.builder()
                .name("Alice Smith")
                .email("alice.smith@example.com")
                .password(passwordEncoder.encode("correctPassword"))
                .role(Role.ROLE_USER)
                .build();
        userRepository.save(user);

        // Login request with invalid password
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("alice.smith@example.com");
        loginRequest.setPassword("wrongPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    void testRegistrationValidationErrorsReturnStandardJson() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("");
        registerRequest.setEmail("not-an-email");
        registerRequest.setPassword("short");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("VALIDATION_ERROR")))
                .andExpect(jsonPath("$.message", is("Input validation failed")))
                .andExpect(jsonPath("$.path", is("/api/auth/register")))
                .andExpect(jsonPath("$.validationErrors.name", not(empty())))
                .andExpect(jsonPath("$.validationErrors.email", not(empty())))
                .andExpect(jsonPath("$.validationErrors.password", not(empty())));
    }

    @Test
    void testJwtFilterUsesEmailClaimInsteadOfSubject() throws Exception {
        User user = User.builder()
                .name("Subject Name")
                .email("claim.user@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .build();
        userRepository.save(user);

        String jwt = Jwts.builder()
                .subject(user.getName())
                .claim("email", user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86_400_000))
                .signWith(Keys.hmacShaKeyFor(
                        "yourVeryLongSecretKeyThatIsAtLeast32CharactersLongForHS256"
                                .getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/complaints")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
    }

    @Test
    void testUserCanUpdateAndDeleteOwnComplaint() throws Exception {
        User user = User.builder()
                .name("Complaint Owner")
                .email("owner@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .build();
        userRepository.save(user);

        String token = loginAndExtractToken("owner@example.com", "password123");

        ComplaintRequest createRequest = new ComplaintRequest();
        createRequest.setTitle("Original facility issue");
        createRequest.setDescription("The facility lights are flickering near the lobby.");
        createRequest.setCategory("Facilities");
        createRequest.setPriority("MEDIUM");

        MvcResult createResult = mockMvc.perform(post("/api/complaints")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long complaintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        ComplaintRequest updateRequest = new ComplaintRequest();
        updateRequest.setTitle("Updated facility issue");
        updateRequest.setDescription("The lobby lights are flickering and need maintenance.");
        updateRequest.setCategory("Maintenance");
        updateRequest.setPriority("HIGH");

        mockMvc.perform(put("/api/complaints/{id}", complaintId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated facility issue")))
                .andExpect(jsonPath("$.category", is("Maintenance")))
                .andExpect(jsonPath("$.priority", is("HIGH")));

        mockMvc.perform(delete("/api/complaints/{id}", complaintId)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/complaints")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", empty()));
    }

    @Test
    void testUserCannotUpdateAnotherUsersComplaint() throws Exception {
        User owner = User.builder()
                .name("Owner")
                .email("owner2@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .build();
        userRepository.save(owner);

        User other = User.builder()
                .name("Other User")
                .email("other@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .build();
        userRepository.save(other);

        String ownerToken = loginAndExtractToken("owner2@example.com", "password123");
        String otherToken = loginAndExtractToken("other@example.com", "password123");

        ComplaintRequest createRequest = new ComplaintRequest();
        createRequest.setTitle("Private complaint");
        createRequest.setDescription("This complaint belongs to the original owner.");
        createRequest.setCategory("IT");
        createRequest.setPriority("LOW");

        MvcResult createResult = mockMvc.perform(post("/api/complaints")
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long complaintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        ComplaintRequest updateRequest = new ComplaintRequest();
        updateRequest.setTitle("Unauthorized edit");
        updateRequest.setDescription("Another user should not be able to edit this complaint.");
        updateRequest.setCategory("Security");
        updateRequest.setPriority("CRITICAL");

        mockMvc.perform(put("/api/complaints/{id}", complaintId)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));

        mockMvc.perform(delete("/api/complaints/{id}", complaintId)
                .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    void testUserCannotUpdateOrDeleteComplaintAfterAdminAcceptsIt() throws Exception {
        User owner = User.builder()
                .name("Locked Owner")
                .email("locked.owner@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .build();
        userRepository.save(owner);

        User admin = User.builder()
                .name("Admin Full Name")
                .email("locking.admin@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_ADMIN)
                .build();
        userRepository.save(admin);

        String ownerToken = loginAndExtractToken("locked.owner@example.com", "password123");
        String adminToken = loginAndExtractToken("locking.admin@example.com", "password123");

        ComplaintRequest createRequest = new ComplaintRequest();
        createRequest.setTitle("Complaint to lock");
        createRequest.setDescription("This complaint will be assigned to an admin and locked.");
        createRequest.setCategory("Operations");
        createRequest.setPriority("MEDIUM");

        MvcResult createResult = mockMvc.perform(post("/api/complaints")
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long complaintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(put("/api/admin/complaints/{id}/assign", complaintId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.assignedToName", is("Admin Full Name")));

        ComplaintRequest updateRequest = new ComplaintRequest();
        updateRequest.setTitle("Should not update");
        updateRequest.setDescription("The complaint is already being processed by admin.");
        updateRequest.setCategory("Operations");
        updateRequest.setPriority("HIGH");

        mockMvc.perform(put("/api/complaints/{id}", complaintId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));

        mockMvc.perform(delete("/api/complaints/{id}", complaintId)
                .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    void testRbacEnforcement() throws Exception {
        // 1. Create a regular USER
        User user = User.builder()
                .name("Normal User")
                .email("user@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_USER)
                .build();
        userRepository.save(user);

        // 2. Create an ADMIN
        User admin = User.builder()
                .name("Admin User")
                .email("admin@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_ADMIN)
                .build();
        userRepository.save(admin);

        // 3. Login as USER to get token
        LoginRequest userLogin = new LoginRequest();
        userLogin.setEmail("user@example.com");
        userLogin.setPassword("password123");

        MvcResult userLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String userResponseJson = userLoginResult.getResponse().getContentAsString();
        JsonNode userNode = objectMapper.readTree(userResponseJson);
        String userToken = userNode.get("token").asText();

        // 4. Login as ADMIN to get token
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setEmail("admin@example.com");
        adminLogin.setPassword("password123");

        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String adminResponseJson = adminLoginResult.getResponse().getContentAsString();
        JsonNode adminNode = objectMapper.readTree(adminResponseJson);
        String adminToken = adminNode.get("token").asText();

        // 5. Verify USER cannot access ADMIN routes (should return 403 Forbidden via AccessDeniedException handler)
        mockMvc.perform(get("/api/admin/complaints")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("FORBIDDEN")))
                .andExpect(jsonPath("$.message", containsString("Access denied")));

        // 6. Verify ADMIN can access ADMIN routes
        mockMvc.perform(get("/api/admin/complaints")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    private String loginAndExtractToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token")
                .asText();
    }
}
