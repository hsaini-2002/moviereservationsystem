package com.mrs.backend.reservation;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ReservationSeatId implements Serializable {

  @Column(name = "reservation_id")
  private Long reservationId;

  @Column(name = "seat_id")
  private Long seatId;

  public ReservationSeatId() {
  }

  public ReservationSeatId(Long reservationId, Long seatId) {
    this.reservationId = reservationId;
    this.seatId = seatId;
  }

  public Long getReservationId() {
    return reservationId;
  }

  public void setReservationId(Long reservationId) {
    this.reservationId = reservationId;
  }

  public Long getSeatId() {
    return seatId;
  }

  public void setSeatId(Long seatId) {
    this.seatId = seatId;
  }

  @Override
  public int hashCode() {
    int result = 17;
    result = 31 * result + (reservationId == null ? 0 : reservationId.hashCode());
    result = 31 * result + (seatId == null ? 0 : seatId.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }
    if (obj == null || getClass() != obj.getClass()) {
      return false;
    }
    ReservationSeatId other = (ReservationSeatId) obj;
    if (reservationId == null) {
      if (other.reservationId != null) {
        return false;
      }
    } else if (!reservationId.equals(other.reservationId)) {
      return false;
    }

    if (seatId == null) {
      return other.seatId == null;
    }
    return seatId.equals(other.seatId);
  }
}
