package com.mrs.backend.user.dto;

public record UserAdminResponse(
    Long id,
    String name,
    String email,
    String role,
    String createdAt) {
}
