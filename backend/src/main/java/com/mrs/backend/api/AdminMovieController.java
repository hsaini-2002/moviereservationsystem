package com.mrs.backend.api;

import java.util.List;
import java.util.Map;

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

import com.mrs.backend.movie.MovieService;
import com.mrs.backend.movie.dto.GenreResponse;
import com.mrs.backend.movie.dto.MovieResponse;
import com.mrs.backend.movie.dto.MovieUpsertRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminMovieController {

  private final MovieService movieService;

  public AdminMovieController(MovieService movieService) {
    this.movieService = movieService;
  }

  @GetMapping("/genres")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public List<GenreResponse> genres() {
    return movieService.listGenres();
  }

  @GetMapping("/movies")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public List<MovieResponse> listMovies() {
    return movieService.listMovies();
  }

  @GetMapping("/movies/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public MovieResponse getMovie(@PathVariable long id) {
    return movieService.getMovie(id);
  }

  @PostMapping("/movies")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  @ResponseStatus(HttpStatus.CREATED)
  public MovieResponse create(@Valid @RequestBody MovieUpsertRequest req) {
    return movieService.create(req);
  }

  @PutMapping("/movies/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public MovieResponse update(@PathVariable long id, @Valid @RequestBody MovieUpsertRequest req) {
    return movieService.update(id, req);
  }

  @DeleteMapping("/movies/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    movieService.delete(id);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }
}
