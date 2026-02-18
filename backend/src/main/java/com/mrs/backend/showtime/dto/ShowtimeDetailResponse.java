package com.mrs.backend.showtime.dto;

public record ShowtimeDetailResponse(
    Long id,
    Long movieId,
    String movieTitle,
    Long auditoriumId,
    String auditoriumName,
    String startTime,
    String endTime,
    int priceCents) {
}
