package com.mrs.backend.reservation;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

  @Query("select r from Reservation r join fetch r.showtime s join fetch s.movie join fetch s.auditorium join fetch r.user order by r.createdAt desc")
  List<Reservation> findAllWithDetailsOrderByCreatedAtDesc();

  @Query("select r from Reservation r where r.showtime.id = :showtimeId")
  List<Reservation> findByShowtimeId(@Param("showtimeId") Long showtimeId);

  @Query("select r from Reservation r where r.showtime.startTime >= :start and r.showtime.startTime < :end")
  List<Reservation> findByShowtimeStartTimeBetween(@Param("start") Instant start, @Param("end") Instant end);
}
