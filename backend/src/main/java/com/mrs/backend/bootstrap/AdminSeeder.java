package com.mrs.backend.bootstrap;

import java.time.Instant;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.mrs.backend.user.User;
import com.mrs.backend.user.UserRepository;
import com.mrs.backend.user.UserRole;

@Component
public class AdminSeeder implements ApplicationRunner {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  private final String adminEmail;
  private final String adminPassword;
  private final String adminName;

  public AdminSeeder(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      @Value("${app.admin.email}") String adminEmail,
      @Value("${app.admin.password}") String adminPassword,
      @Value("${app.admin.name:Admin}") String adminName) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.adminEmail = adminEmail;
    this.adminPassword = adminPassword;
    this.adminName = adminName;
  }

  @Override
  public void run(ApplicationArguments args) {
    String normalizedEmail = adminEmail.trim().toLowerCase();
    User admin = userRepository.findByEmailIgnoreCase(normalizedEmail).orElseGet(User::new);

    admin.setName(adminName);
    admin.setEmail(normalizedEmail);
    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
    admin.setRole(UserRole.SUPER_ADMIN);
    if (admin.getCreatedAt() == null) {
      admin.setCreatedAt(Instant.now());
    }

    userRepository.save(admin);
  }
}
