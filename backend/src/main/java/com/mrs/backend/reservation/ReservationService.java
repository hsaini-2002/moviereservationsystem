package com.mrs.backend.reservation;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mrs.backend.reservation.dto.ReservationResponse;
import com.mrs.backend.reservation.dto.ReserveSeatsRequest;
import com.mrs.backend.reservation.dto.ShowtimeSeatAvailabilityResponse;
import com.mrs.backend.seat.Seat;
import com.mrs.backend.seat.SeatRepository;
import com.mrs.backend.security.CurrentUserService;
import com.mrs.backend.showtime.Showtime;
import com.mrs.backend.showtime.ShowtimeRepository;
import com.mrs.backend.user.User;

@Service
public class ReservationService {

  private final ShowtimeRepository showtimeRepository;
  private final SeatRepository seatRepository;
  private final ReservationRepository reservationRepository;
  private final ReservationSeatRepository reservationSeatRepository;
  private final CurrentUserService currentUserService;

  public ReservationService(ShowtimeRepository showtimeRepository,
      SeatRepository seatRepository,
      ReservationRepository reservationRepository,
      ReservationSeatRepository reservationSeatRepository,
      CurrentUserService currentUserService) {
    this.showtimeRepository = showtimeRepository;
    this.seatRepository = seatRepository;
    this.reservationRepository = reservationRepository;
    this.reservationSeatRepository = reservationSeatRepository;
    this.currentUserService = currentUserService;
  }

  @Transactional(readOnly = true)
  public ShowtimeSeatAvailabilityResponse availability(long showtimeId) {
    List<Long> booked = reservationSeatRepository.findBookedSeatIds(showtimeId);
    return new ShowtimeSeatAvailabilityResponse(showtimeId, booked);
  }

  @Transactional
  public ReservationResponse reserve(long showtimeId, ReserveSeatsRequest req) {
    User user = currentUserService.getCurrentUser()
        .orElseThrow(() -> new IllegalStateException("Unauthorized"));

    Showtime showtime = showtimeRepository.findById(showtimeId)
        .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

    Set<Long> uniqueSeatIds = new HashSet<>(req.seatIds());
    if (uniqueSeatIds.isEmpty()) {
      throw new IllegalArgumentException("seatIds must not be empty");
    }

    List<Seat> seats = seatRepository.findAllById(uniqueSeatIds);
    if (seats.size() != uniqueSeatIds.size()) {
      throw new IllegalArgumentException("One or more seats not found");
    }

    for (Seat seat : seats) {
      if (!seat.getAuditorium().getId().equals(showtime.getAuditorium().getId())) {
        throw new IllegalArgumentException("Seat does not belong to showtime auditorium");
      }
    }

    Reservation reservation = new Reservation();
    reservation.setUser(user);
    reservation.setShowtime(showtime);
    reservation.setStatus(ReservationStatus.CONFIRMED);
    reservation.setTotalAmountCents(showtime.getPriceCents() * seats.size());
    reservation.setCreatedAt(Instant.now());

    Reservation saved = reservationRepository.save(reservation);

    try {
      for (Seat seat : seats) {
        ReservationSeat rs = new ReservationSeat();
        rs.setId(new ReservationSeatId(saved.getId(), seat.getId()));
        rs.setReservation(saved);
        rs.setSeat(seat);
        rs.setShowtime(showtime);
        reservationSeatRepository.save(rs);
      }
    } catch (DataIntegrityViolationException ex) {
      throw new SeatAlreadyBookedException("One or more selected seats are already booked");
    }

    return new ReservationResponse(
        saved.getId(),
        showtimeId,
        showtime.getMovie().getTitle(),
        showtime.getAuditorium().getName(),
        showtime.getStartTime().toString(),
        showtime.getEndTime().toString(),
        saved.getStatus().name(),
        saved.getTotalAmountCents(),
        saved.getCreatedAt().toString(),
        seats.stream().map(Seat::getId).toList(),
        seats.stream().map(seat -> seat.getRowLabel() + "-" + seat.getSeatNumber()).toList());
  }

  @Transactional(readOnly = true)
  public List<ReservationResponse> myReservations() {
    User user = currentUserService.getCurrentUser()
        .orElseThrow(() -> new IllegalStateException("Unauthorized"));

    return reservationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(r -> {
          List<Long> seatIds = reservationSeatRepository.findSeatIdsForReservation(r.getId());

          Map<Long, String> idToLabel = seatRepository.findAllById(seatIds).stream()
              .collect(Collectors.toMap(Seat::getId, s -> s.getRowLabel() + "-" + s.getSeatNumber()));

          List<String> seatLabels = seatIds.stream().map(idToLabel::get).toList();
          return new ReservationResponse(
              r.getId(),
              r.getShowtime().getId(),
              r.getShowtime().getMovie().getTitle(),
              r.getShowtime().getAuditorium().getName(),
              r.getShowtime().getStartTime().toString(),
              r.getShowtime().getEndTime().toString(),
              r.getStatus().name(),
              r.getTotalAmountCents(),
              r.getCreatedAt().toString(),
              seatIds,
              seatLabels);
        })
        .toList();
  }

  @Transactional
  public void cancel(long reservationId) {
    User user = currentUserService.getCurrentUser()
        .orElseThrow(() -> new IllegalStateException("Unauthorized"));

    Reservation r = reservationRepository.findById(reservationId)
        .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

    if (!r.getUser().getId().equals(user.getId())) {
      throw new IllegalArgumentException("Not allowed");
    }

    if (!r.getShowtime().getStartTime().isAfter(Instant.now())) {
      throw new IllegalArgumentException("Only upcoming reservations can be cancelled");
    }

    r.setStatus(ReservationStatus.CANCELLED);
    reservationRepository.save(r);
  }

  public static class SeatAlreadyBookedException extends RuntimeException {
    public SeatAlreadyBookedException(String message) {
      super(message);
    }
  }
}
