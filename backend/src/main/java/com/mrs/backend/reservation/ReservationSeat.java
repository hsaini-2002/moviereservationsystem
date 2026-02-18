package com.mrs.backend.reservation;

import com.mrs.backend.seat.Seat;
import com.mrs.backend.showtime.Showtime;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "reservation_seat")
public class ReservationSeat {

  @EmbeddedId
  private ReservationSeatId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("reservationId")
  @JoinColumn(name = "reservation_id", nullable = false)
  private Reservation reservation;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("seatId")
  @JoinColumn(name = "seat_id", nullable = false)
  private Seat seat;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "showtime_id", nullable = false)
  private Showtime showtime;

  public ReservationSeatId getId() {
    return id;
  }

  public void setId(ReservationSeatId id) {
    this.id = id;
  }

  public Reservation getReservation() {
    return reservation;
  }

  public void setReservation(Reservation reservation) {
    this.reservation = reservation;
  }

  public Seat getSeat() {
    return seat;
  }

  public void setSeat(Seat seat) {
    this.seat = seat;
  }

  public Showtime getShowtime() {
    return showtime;
  }

  public void setShowtime(Showtime showtime) {
    this.showtime = showtime;
  }
}
