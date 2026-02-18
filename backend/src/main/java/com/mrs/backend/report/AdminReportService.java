package com.mrs.backend.report;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mrs.backend.report.dto.AdminReportShowtimeRow;
import com.mrs.backend.report.dto.AdminReportShowtimesResponse;
import com.mrs.backend.report.dto.AdminReportSummaryResponse;
import com.mrs.backend.reservation.Reservation;
import com.mrs.backend.reservation.ReservationRepository;
import com.mrs.backend.reservation.ReservationSeatRepository;
import com.mrs.backend.reservation.ReservationStatus;
import com.mrs.backend.seat.SeatRepository;
import com.mrs.backend.showtime.Showtime;
import com.mrs.backend.showtime.ShowtimeRepository;

@Service
public class AdminReportService {

  private final ReservationRepository reservationRepository;
  private final ReservationSeatRepository reservationSeatRepository;
  private final ShowtimeRepository showtimeRepository;
  private final SeatRepository seatRepository;

  public AdminReportService(
      ReservationRepository reservationRepository,
      ReservationSeatRepository reservationSeatRepository,
      ShowtimeRepository showtimeRepository,
      SeatRepository seatRepository) {
    this.reservationRepository = reservationRepository;
    this.reservationSeatRepository = reservationSeatRepository;
    this.showtimeRepository = showtimeRepository;
    this.seatRepository = seatRepository;
  }

  private static Instant dayStartUtc(LocalDate date) {
    return date.atStartOfDay().toInstant(ZoneOffset.UTC);
  }

  private static Instant nextDayStartUtc(LocalDate date) {
    return date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
  }

  @Transactional(readOnly = true)
  public AdminReportSummaryResponse summary(LocalDate date) {
    Instant start = dayStartUtc(date);
    Instant end = nextDayStartUtc(date);

    List<Reservation> reservations = reservationRepository.findByShowtimeStartTimeBetween(start, end);

    long total = reservations.size();
    long confirmed = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.CONFIRMED).count();
    long cancelled = reservations.stream().filter(r -> r.getStatus() == ReservationStatus.CANCELLED).count();
    long revenueCents = reservations.stream()
        .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
        .mapToLong(Reservation::getTotalAmountCents)
        .sum();

    List<Showtime> showtimes = showtimeRepository.findWithDetailsByStartTimeBetween(start, end);

    long capacity = 0;
    long confirmedSeats = 0;
    long cancelledSeats = 0;

    for (Showtime s : showtimes) {
      long showCapacity = seatRepository.countByAuditoriumId(s.getAuditorium().getId());
      capacity += showCapacity;
      confirmedSeats += reservationSeatRepository.countSeatsByShowtimeAndReservationStatus(s.getId(), ReservationStatus.CONFIRMED);
      cancelledSeats += reservationSeatRepository.countSeatsByShowtimeAndReservationStatus(s.getId(), ReservationStatus.CANCELLED);
    }

    double occupancy = capacity == 0 ? 0.0 : (double) confirmedSeats / (double) capacity;

    return new AdminReportSummaryResponse(
        date.toString(),
        total,
        confirmed,
        cancelled,
        revenueCents,
        confirmedSeats,
        cancelledSeats,
        capacity,
        occupancy);
  }

  @Transactional(readOnly = true)
  public AdminReportShowtimesResponse showtimes(LocalDate date) {
    Instant start = dayStartUtc(date);
    Instant end = nextDayStartUtc(date);

    List<Showtime> showtimes = showtimeRepository.findWithDetailsByStartTimeBetween(start, end);

    Map<Long, List<Reservation>> reservationsByShowtime = reservationRepository.findByShowtimeStartTimeBetween(start, end)
        .stream()
        .collect(Collectors.groupingBy(r -> r.getShowtime().getId()));

    List<AdminReportShowtimeRow> rows = showtimes.stream().map(s -> {
      long capacity = seatRepository.countByAuditoriumId(s.getAuditorium().getId());
      long booked = reservationSeatRepository.findBookedSeatIds(s.getId()).size();

      long revenueCents = reservationsByShowtime.getOrDefault(s.getId(), List.of()).stream()
          .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
          .mapToLong(Reservation::getTotalAmountCents)
          .sum();

      return new AdminReportShowtimeRow(
          s.getId(),
          s.getMovie().getId(),
          s.getMovie().getTitle(),
          s.getAuditorium().getId(),
          s.getAuditorium().getName(),
          s.getStartTime().toString(),
          s.getEndTime().toString(),
          s.getPriceCents(),
          capacity,
          booked,
          revenueCents);
    }).toList();

    return new AdminReportShowtimesResponse(date.toString(), rows);
  }
}
