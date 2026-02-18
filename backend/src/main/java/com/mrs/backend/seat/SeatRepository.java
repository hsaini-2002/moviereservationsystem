package com.mrs.backend.seat;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {
  List<Seat> findByAuditoriumIdOrderByRowLabelAscSeatNumberAsc(Long auditoriumId);

  long countByAuditoriumId(Long auditoriumId);
}
