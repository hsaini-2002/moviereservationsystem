package com.mrs.backend.showtime;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditoriumRepository extends JpaRepository<Auditorium, Long> {
  Optional<Auditorium> findByNameIgnoreCase(String name);
}
