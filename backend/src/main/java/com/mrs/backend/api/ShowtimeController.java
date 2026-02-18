package com.mrs.backend.api;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.showtime.Showtime;
import com.mrs.backend.showtime.ShowtimeRepository;
import com.mrs.backend.showtime.dto.ShowtimeDetailResponse;

@RestController
@RequestMapping("/api")
public class ShowtimeController {

  private final ShowtimeRepository showtimeRepository;

  public ShowtimeController(ShowtimeRepository showtimeRepository) {
    this.showtimeRepository = showtimeRepository;
  }

  @GetMapping("/showtimes/{id}")
  public ShowtimeDetailResponse showtime(@PathVariable long id) {
    Showtime s = showtimeRepository.findDetailById(id)
        .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

    return new ShowtimeDetailResponse(
        s.getId(),
        s.getMovie().getId(),
        s.getMovie().getTitle(),
        s.getAuditorium().getId(),
        s.getAuditorium().getName(),
        s.getStartTime().toString(),
        s.getEndTime().toString(),
        s.getPriceCents());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }
}
