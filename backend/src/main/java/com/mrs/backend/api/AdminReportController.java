package com.mrs.backend.api;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mrs.backend.report.AdminReportService;
import com.mrs.backend.report.dto.AdminReportShowtimesResponse;
import com.mrs.backend.report.dto.AdminReportSummaryResponse;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

  private final AdminReportService reportService;

  public AdminReportController(AdminReportService reportService) {
    this.reportService = reportService;
  }

  @GetMapping("/summary")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public AdminReportSummaryResponse summary(@RequestParam String date) {
    return reportService.summary(LocalDate.parse(date));
  }

  @GetMapping("/showtimes")
  @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
  public AdminReportShowtimesResponse showtimes(@RequestParam String date) {
    return reportService.showtimes(LocalDate.parse(date));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(IllegalArgumentException ex) {
    return Map.of("error", ex.getMessage());
  }
}
