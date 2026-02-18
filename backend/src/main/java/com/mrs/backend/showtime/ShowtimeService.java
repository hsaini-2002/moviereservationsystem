package com.mrs.backend.showtime;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Duration;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mrs.backend.movie.Movie;
import com.mrs.backend.movie.MovieRepository;
import com.mrs.backend.showtime.dto.ShowtimeResponse;
import com.mrs.backend.showtime.dto.ShowtimeUpsertRequest;

@Service
public class ShowtimeService {

  private static final Duration AUDITORIUM_BUFFER = Duration.ofMinutes(20);

  private final ShowtimeRepository showtimeRepository;
  private final MovieRepository movieRepository;
  private final AuditoriumRepository auditoriumRepository;

  public ShowtimeService(ShowtimeRepository showtimeRepository, MovieRepository movieRepository,
      AuditoriumRepository auditoriumRepository) {
    this.showtimeRepository = showtimeRepository;
    this.movieRepository = movieRepository;
    this.auditoriumRepository = auditoriumRepository;
  }

  @Transactional(readOnly = true)
  public List<ShowtimeResponse> listForMovieOnDate(long movieId, LocalDate date) {
    ZoneId zone = ZoneId.systemDefault();
    ZonedDateTime start = date.atStartOfDay(zone);
    ZonedDateTime end = date.plusDays(1).atStartOfDay(zone);

    return showtimeRepository.findByMovieIdAndStartTimeBetweenOrderByStartTimeAsc(
        movieId,
        start.toInstant(),
        end.toInstant()).stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public List<ShowtimeResponse> listAll() {
    Instant start = Instant.EPOCH;
    Instant end = Instant.parse("9999-12-31T23:59:59Z");
    return showtimeRepository.findWithDetailsByStartTimeBetween(start, end)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public ShowtimeResponse create(ShowtimeUpsertRequest req) {
    Movie movie = movieRepository.findById(req.movieId())
        .orElseThrow(() -> new IllegalArgumentException("Movie not found"));

    Auditorium aud = auditoriumRepository.findById(req.auditoriumId())
        .orElseThrow(() -> new IllegalArgumentException("Auditorium not found"));

    Instant start = Instant.parse(req.startTime());
    Instant end = Instant.parse(req.endTime());
    if (!end.isAfter(start)) {
      throw new IllegalArgumentException("endTime must be after startTime");
    }

    Instant windowStart = start.minus(AUDITORIUM_BUFFER);
    Instant windowEnd = end.plus(AUDITORIUM_BUFFER);
    if (showtimeRepository.existsAuditoriumConflict(aud.getId(), windowStart, windowEnd)) {
      throw new IllegalArgumentException("Auditorium already has another showtime within a 20 minute buffer");
    }

    Showtime s = new Showtime();
    s.setMovie(movie);
    s.setAuditorium(aud);
    s.setStartTime(start);
    s.setEndTime(end);
    s.setPriceCents(req.priceCents());
    s.setCreatedAt(Instant.now());

    return toResponse(showtimeRepository.save(s));
  }

  @Transactional
  public ShowtimeResponse update(long id, ShowtimeUpsertRequest req) {
    Showtime s = showtimeRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

    Movie movie = movieRepository.findById(req.movieId())
        .orElseThrow(() -> new IllegalArgumentException("Movie not found"));

    Auditorium aud = auditoriumRepository.findById(req.auditoriumId())
        .orElseThrow(() -> new IllegalArgumentException("Auditorium not found"));

    Instant start = Instant.parse(req.startTime());
    Instant end = Instant.parse(req.endTime());
    if (!end.isAfter(start)) {
      throw new IllegalArgumentException("endTime must be after startTime");
    }

    Instant windowStart = start.minus(AUDITORIUM_BUFFER);
    Instant windowEnd = end.plus(AUDITORIUM_BUFFER);
    if (showtimeRepository.existsAuditoriumConflictExcluding(aud.getId(), s.getId(), windowStart, windowEnd)) {
      throw new IllegalArgumentException("Auditorium already has another showtime within a 20 minute buffer");
    }

    s.setMovie(movie);
    s.setAuditorium(aud);
    s.setStartTime(start);
    s.setEndTime(end);
    s.setPriceCents(req.priceCents());

    return toResponse(showtimeRepository.save(s));
  }

  @Transactional
  public void delete(long id) {
    if (!showtimeRepository.existsById(id)) {
      throw new IllegalArgumentException("Showtime not found");
    }
    showtimeRepository.deleteById(id);
  }

  private ShowtimeResponse toResponse(Showtime s) {
    return new ShowtimeResponse(
        s.getId(),
        s.getMovie().getId(),
        s.getAuditorium().getId(),
        s.getAuditorium().getName(),
        s.getStartTime().toString(),
        s.getEndTime().toString(),
        s.getPriceCents());
  }
}
