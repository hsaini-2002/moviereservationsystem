package com.mrs.backend.api;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.movie.MovieService;
import com.mrs.backend.movie.dto.GenreResponse;
import com.mrs.backend.movie.dto.MovieResponse;
import com.mrs.backend.showtime.ShowtimeService;
import com.mrs.backend.showtime.dto.ShowtimeResponse;

@RestController
@RequestMapping("/api")
public class PublicMovieController {

  private final MovieService movieService;
  private final ShowtimeService showtimeService;

  public PublicMovieController(MovieService movieService, ShowtimeService showtimeService) {
    this.movieService = movieService;
    this.showtimeService = showtimeService;
  }

  @GetMapping("/genres")
  public List<GenreResponse> genres() {
    return movieService.listGenres();
  }

  @GetMapping("/movies")
  public List<MovieResponse> movies() {
    return movieService.listMovies();
  }

  @GetMapping("/movies/{id}")
  public MovieResponse movie(@PathVariable long id) {
    return movieService.getMovie(id);
  }

  @GetMapping("/movies/{id}/showtimes")
  public List<ShowtimeResponse> showtimes(@PathVariable long id, @RequestParam String date) {
    return showtimeService.listForMovieOnDate(id, LocalDate.parse(date));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }
}
