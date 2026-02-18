package com.mrs.backend.reservation.dto;

import java.util.List;

public record ReservationResponse(
    Long id,
    Long showtimeId,
    String movieTitle,
    String auditoriumName,
    String showtimeStartTime,
    String showtimeEndTime,
    String status,
    int totalAmountCents,
    String createdAt,
    List<Long> seatIds,
    List<String> seatLabels) {
}
