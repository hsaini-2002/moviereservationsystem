package com.mrs.backend.reservation.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record ReserveSeatsRequest(
    @NotEmpty List<Long> seatIds) {
}
