package com.mrs.backend.movie;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GenreRepository extends JpaRepository<Genre, Long> {
  Optional<Genre> findByNameIgnoreCase(String name);
}
