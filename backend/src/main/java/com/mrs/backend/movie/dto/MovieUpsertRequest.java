package com.mrs.backend.movie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MovieUpsertRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank String description,
    String posterUrl,
    @NotNull Long genreId,
    @NotNull Boolean active) {
}
