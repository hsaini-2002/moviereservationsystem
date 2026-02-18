package com.mrs.backend.user;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmailIgnoreCase(String email);

  boolean existsByRole(UserRole role);

  List<User> findAllByOrderByCreatedAtDesc();
}
