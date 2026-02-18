package com.mrs.backend.movie.dto;

public record MovieResponse(
    Long id,
    String title,
    String description,
    String posterUrl,
    boolean active,
    GenreResponse genre) {
}
