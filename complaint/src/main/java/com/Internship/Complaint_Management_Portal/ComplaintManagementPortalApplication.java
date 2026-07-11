package com.Internship.Complaint_Management_Portal;

import com.Internship.Complaint_Management_Portal.model.Role;
import com.Internship.Complaint_Management_Portal.model.User;
import com.Internship.Complaint_Management_Portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ComplaintManagementPortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(ComplaintManagementPortalApplication.class, args);
		System.out.println("complaint management is runnig");
	}

	@Bean
	public CommandLineRunner demoData(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.demo-data.enabled:false}") boolean demoDataEnabled) {
		return args -> {
			if (!demoDataEnabled) {
				return;
			}

			if (!userRepository.existsByEmail("admin@example.com")) {
				User admin = User.builder()
						.name("Default Admin")
						.email("admin@example.com")
						.password(passwordEncoder.encode("password123"))
						.role(Role.ROLE_ADMIN)
						.build();
				userRepository.save(admin);
			}

			if (!userRepository.existsByEmail("user@example.com")) {
				User user = User.builder()
						.name("Default User")
						.email("user@example.com")
						.password(passwordEncoder.encode("password123"))
						.role(Role.ROLE_USER)
						.build();
				userRepository.save(user);
			}
		};

	}
}
