package com.mrs.backend.showtime.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ShowtimeUpsertRequest(
    @NotNull Long movieId,
    @NotNull Long auditoriumId,
    @NotNull String startTime,
    @NotNull String endTime,
    @Min(0) int priceCents) {
}
