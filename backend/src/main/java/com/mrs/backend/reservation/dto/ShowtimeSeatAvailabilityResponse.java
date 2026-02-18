package com.mrs.backend.reservation.dto;

import java.util.List;

public record ShowtimeSeatAvailabilityResponse(
    Long showtimeId,
    List<Long> bookedSeatIds) {
}
