package com.mrs.backend.report.dto;

public record AdminReportShowtimeRow(
    Long showtimeId,
    Long movieId,
    String movieTitle,
    Long auditoriumId,
    String auditoriumName,
    String startTime,
    String endTime,
    int priceCents,
    long capacity,
    long bookedSeats,
    long revenueCents) {
}
