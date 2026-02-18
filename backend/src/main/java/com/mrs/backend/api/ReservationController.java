package com.mrs.backend.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.reservation.ReservationService;
import com.mrs.backend.reservation.ReservationService.SeatAlreadyBookedException;
import com.mrs.backend.reservation.dto.ReservationResponse;
import com.mrs.backend.reservation.dto.ReserveSeatsRequest;
import com.mrs.backend.reservation.dto.ShowtimeSeatAvailabilityResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ReservationController {

  private final ReservationService reservationService;

  public ReservationController(ReservationService reservationService) {
    this.reservationService = reservationService;
  }

  @GetMapping("/showtimes/{id}/availability")
  public ShowtimeSeatAvailabilityResponse availability(@PathVariable long id) {
    return reservationService.availability(id);
  }

  @PostMapping("/showtimes/{id}/reservations")
  @ResponseStatus(HttpStatus.CREATED)
  public ReservationResponse reserve(@PathVariable long id, @Valid @RequestBody ReserveSeatsRequest req) {
    return reservationService.reserve(id, req);
  }

  @GetMapping("/reservations/mine")
  public List<ReservationResponse> mine() {
    return reservationService.myReservations();
  }

  @DeleteMapping("/reservations/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void cancel(@PathVariable long id) {
    reservationService.cancel(id);
  }

  @ExceptionHandler(SeatAlreadyBookedException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public Map<String, Object> conflict(SeatAlreadyBookedException ex) {
    return Map.of("error", ex.getMessage());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }

  @ExceptionHandler(IllegalStateException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public Map<String, Object> unauthorized(IllegalStateException ex) {
    return Map.of("error", ex.getMessage());
  }
}
