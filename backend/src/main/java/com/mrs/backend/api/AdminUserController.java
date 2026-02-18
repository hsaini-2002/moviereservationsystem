package com.mrs.backend.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.user.User;
import com.mrs.backend.user.UserRepository;
import com.mrs.backend.user.UserRole;
import com.mrs.backend.user.dto.UserAdminResponse;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

  private final UserRepository userRepository;

  public AdminUserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public List<UserAdminResponse> listUsers() {
    return userRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(this::toResponse)
        .toList();
  }

  @PostMapping("/{id}/promote")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public UserAdminResponse promote(@PathVariable long id) {
    User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    u.setRole(UserRole.ADMIN);
    userRepository.save(u);
    return toResponse(u);
  }

  @PostMapping("/{id}/demote")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public UserAdminResponse demote(@PathVariable long id) {
    User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    if (u.getRole() == UserRole.SUPER_ADMIN) {
      throw new IllegalArgumentException("Cannot demote SUPER_ADMIN");
    }
    u.setRole(UserRole.USER);
    userRepository.save(u);
    return toResponse(u);
  }

  private UserAdminResponse toResponse(User u) {
    Instant createdAt = u.getCreatedAt();
    return new UserAdminResponse(
        u.getId(),
        u.getName(),
        u.getEmail(),
        u.getRole().name(),
        createdAt == null ? null : createdAt.toString());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }
}
