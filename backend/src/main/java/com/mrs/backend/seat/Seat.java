package com.mrs.backend.seat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.mrs.backend.showtime.Auditorium;

@Entity
@Table(name = "seat")
public class Seat {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "auditorium_id", nullable = false)
  private Auditorium auditorium;

  @Column(name = "row_label", nullable = false, length = 10)
  private String rowLabel;

  @Column(name = "seat_number", nullable = false)
  private int seatNumber;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Auditorium getAuditorium() {
    return auditorium;
  }

  public void setAuditorium(Auditorium auditorium) {
    this.auditorium = auditorium;
  }

  public String getRowLabel() {
    return rowLabel;
  }

  public void setRowLabel(String rowLabel) {
    this.rowLabel = rowLabel;
  }

  public int getSeatNumber() {
    return seatNumber;
  }

  public void setSeatNumber(int seatNumber) {
    this.seatNumber = seatNumber;
  }
}
