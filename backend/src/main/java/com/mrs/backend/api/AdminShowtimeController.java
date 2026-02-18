package com.mrs.backend.api;

import java.util.Map;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.showtime.ShowtimeService;
import com.mrs.backend.showtime.dto.ShowtimeResponse;
import com.mrs.backend.showtime.dto.ShowtimeUpsertRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminShowtimeController {

  private final ShowtimeService showtimeService;

  public AdminShowtimeController(ShowtimeService showtimeService) {
    this.showtimeService = showtimeService;
  }

  @PostMapping("/showtimes")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  @ResponseStatus(HttpStatus.CREATED)
  public ShowtimeResponse create(@Valid @RequestBody ShowtimeUpsertRequest req) {
    return showtimeService.create(req);
  }

  @GetMapping("/showtimes")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public List<ShowtimeResponse> list() {
    return showtimeService.listAll();
  }

  @PutMapping("/showtimes/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public ShowtimeResponse update(@PathVariable long id, @Valid @RequestBody ShowtimeUpsertRequest req) {
    return showtimeService.update(id, req);
  }

  @DeleteMapping("/showtimes/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    showtimeService.delete(id);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }
}
