package com.mrs.backend.seat;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mrs.backend.seat.dto.SeatResponse;
import com.mrs.backend.seat.dto.ShowtimeSeatsResponse;
import com.mrs.backend.showtime.Showtime;
import com.mrs.backend.showtime.ShowtimeRepository;

@Service
public class SeatService {

  private final ShowtimeRepository showtimeRepository;
  private final SeatRepository seatRepository;

  public SeatService(ShowtimeRepository showtimeRepository, SeatRepository seatRepository) {
    this.showtimeRepository = showtimeRepository;
    this.seatRepository = seatRepository;
  }

  @Transactional(readOnly = true)
  public ShowtimeSeatsResponse listSeatsForShowtime(long showtimeId) {
    Showtime s = showtimeRepository.findById(showtimeId)
        .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

    List<SeatResponse> seats = seatRepository.findByAuditoriumIdOrderByRowLabelAscSeatNumberAsc(
        s.getAuditorium().getId()).stream()
        .map(seat -> new SeatResponse(seat.getId(), seat.getRowLabel(), seat.getSeatNumber()))
        .toList();

    return new ShowtimeSeatsResponse(
        s.getId(),
        s.getAuditorium().getId(),
        s.getAuditorium().getName(),
        seats);
  }
}
