package com.mrs.backend.report.dto;

import java.util.List;

public record AdminReportShowtimesResponse(
    String date,
    List<AdminReportShowtimeRow> showtimes) {
}
