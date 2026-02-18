package com.mrs.backend.showtime.dto;

public record ShowtimeResponse(
    Long id,
    Long movieId,
    Long auditoriumId,
    String auditoriumName,
    String startTime,
    String endTime,
    int priceCents) {
}
