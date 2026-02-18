package com.mrs.backend.auth;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.security.JwtService;
import com.mrs.backend.user.User;
import com.mrs.backend.user.UserRepository;
import com.mrs.backend.user.UserRole;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @PostMapping("/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> signup(@Valid @RequestBody SignupRequest req) {
    userRepository.findByEmailIgnoreCase(req.email()).ifPresent(u -> {
      throw new IllegalArgumentException("Email already in use");
    });

    User user = new User();
    user.setName(req.name());
    user.setEmail(req.email().trim().toLowerCase());
    user.setPasswordHash(passwordEncoder.encode(req.password()));
    user.setRole(UserRole.USER);
    user.setCreatedAt(Instant.now());

    User saved = userRepository.save(user);
    String token = jwtService.generateToken(saved);

    return Map.of(
        "token", token,
        "user", Map.of(
            "id", saved.getId(),
            "name", saved.getName(),
            "email", saved.getEmail(),
            "role", saved.getRole().name()));
  }

  @PostMapping("/login")
  public Map<String, Object> login(@Valid @RequestBody LoginRequest req) {
    User user = userRepository.findByEmailIgnoreCase(req.email())
        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    String token = jwtService.generateToken(user);
    return Map.of(
        "token", token,
        "user", Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name()));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> handleIllegalArgument(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }
}
