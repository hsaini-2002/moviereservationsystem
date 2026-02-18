package com.mrs.backend.reservation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationSeatRepository extends JpaRepository<ReservationSeat, ReservationSeatId> {

  @Query("select rs.seat.id from ReservationSeat rs where rs.showtime.id = :showtimeId and rs.reservation.status <> com.mrs.backend.reservation.ReservationStatus.CANCELLED")
  List<Long> findBookedSeatIds(@Param("showtimeId") long showtimeId);

  @Query("select rs.seat.id from ReservationSeat rs where rs.reservation.id = :reservationId")
  List<Long> findSeatIdsForReservation(@Param("reservationId") long reservationId);

  @Query("select count(rs) from ReservationSeat rs where rs.showtime.id = :showtimeId and rs.reservation.status = :status")
  long countSeatsByShowtimeAndReservationStatus(@Param("showtimeId") long showtimeId, @Param("status") ReservationStatus status);
}
