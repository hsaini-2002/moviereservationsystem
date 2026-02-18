package com.mrs.backend.report.dto;

public record AdminReportSummaryResponse(
    String date,
    long totalReservations,
    long confirmedReservations,
    long cancelledReservations,
    long totalRevenueCents,
    long confirmedSeats,
    long cancelledSeats,
    long totalSeatsCapacity,
    double occupancyRate) {
}
