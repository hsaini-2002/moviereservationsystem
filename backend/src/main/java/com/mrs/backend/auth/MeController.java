package com.mrs.backend.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.security.CurrentUserService;

@RestController
@RequestMapping("/api")
public class MeController {

  private final CurrentUserService currentUserService;

  public MeController(CurrentUserService currentUserService) {
    this.currentUserService = currentUserService;
  }

  @GetMapping("/me")
  public Map<String, Object> me() {
    return currentUserService.getCurrentUser()
        .map(u -> Map.<String, Object>of(
            "id", u.getId(),
            "name", u.getName(),
            "email", u.getEmail(),
            "role", u.getRole().name()))
        .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
  }

  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  private static class UnauthorizedException extends RuntimeException {
    UnauthorizedException(String message) {
      super(message);
    }
  }
}
