package com.mrs.backend.movie;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mrs.backend.movie.dto.GenreResponse;
import com.mrs.backend.movie.dto.MovieResponse;
import com.mrs.backend.movie.dto.MovieUpsertRequest;

@Service
public class MovieService {

  private final MovieRepository movieRepository;
  private final GenreRepository genreRepository;

  public MovieService(MovieRepository movieRepository, GenreRepository genreRepository) {
    this.movieRepository = movieRepository;
    this.genreRepository = genreRepository;
  }

  @Transactional(readOnly = true)
  public List<GenreResponse> listGenres() {
    return genreRepository.findAll().stream()
        .map(g -> new GenreResponse(g.getId(), g.getName()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<MovieResponse> listMovies() {
    return movieRepository.findAll().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public MovieResponse getMovie(long id) {
    Movie m = movieRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Movie not found"));
    return toResponse(m);
  }

  @Transactional
  public MovieResponse create(MovieUpsertRequest req) {
    Genre genre = genreRepository.findById(req.genreId())
        .orElseThrow(() -> new IllegalArgumentException("Genre not found"));

    Movie movie = new Movie();
    movie.setTitle(req.title());
    movie.setDescription(req.description());
    movie.setPosterUrl(req.posterUrl());
    movie.setGenre(genre);
    movie.setActive(Boolean.TRUE.equals(req.active()));
    movie.setCreatedAt(Instant.now());

    return toResponse(movieRepository.save(movie));
  }

  @Transactional
  public MovieResponse update(long id, MovieUpsertRequest req) {
    Movie movie = movieRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Movie not found"));

    Genre genre = genreRepository.findById(req.genreId())
        .orElseThrow(() -> new IllegalArgumentException("Genre not found"));

    movie.setTitle(req.title());
    movie.setDescription(req.description());
    movie.setPosterUrl(req.posterUrl());
    movie.setGenre(genre);
    movie.setActive(Boolean.TRUE.equals(req.active()));

    return toResponse(movieRepository.save(movie));
  }

  @Transactional
  public void delete(long id) {
    if (!movieRepository.existsById(id)) {
      throw new IllegalArgumentException("Movie not found");
    }
    movieRepository.deleteById(id);
  }

  private MovieResponse toResponse(Movie m) {
    Genre g = m.getGenre();
    GenreResponse gr = new GenreResponse(g.getId(), g.getName());
    return new MovieResponse(
        m.getId(),
        m.getTitle(),
        m.getDescription(),
        m.getPosterUrl(),
        m.isActive(),
        gr);
  }
}
