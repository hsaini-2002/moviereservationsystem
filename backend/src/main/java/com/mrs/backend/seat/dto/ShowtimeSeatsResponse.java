package com.mrs.backend.seat.dto;

import java.util.List;

public record ShowtimeSeatsResponse(
    Long showtimeId,
    Long auditoriumId,
    String auditoriumName,
    List<SeatResponse> seats) {
}
