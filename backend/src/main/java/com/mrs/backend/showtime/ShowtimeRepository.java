package com.mrs.backend.showtime;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
  List<Showtime> findByMovieIdAndStartTimeBetweenOrderByStartTimeAsc(Long movieId, Instant start, Instant end);

  @Query("select count(s) > 0 from Showtime s where s.auditorium.id = :auditoriumId and s.startTime < :windowEnd and s.endTime > :windowStart")
  boolean existsAuditoriumConflict(@Param("auditoriumId") Long auditoriumId,
      @Param("windowStart") Instant windowStart,
      @Param("windowEnd") Instant windowEnd);

  @Query("select count(s) > 0 from Showtime s where s.auditorium.id = :auditoriumId and s.id <> :excludeId and s.startTime < :windowEnd and s.endTime > :windowStart")
  boolean existsAuditoriumConflictExcluding(@Param("auditoriumId") Long auditoriumId,
      @Param("excludeId") Long excludeId,
      @Param("windowStart") Instant windowStart,
      @Param("windowEnd") Instant windowEnd);

  @Query("select s from Showtime s join fetch s.movie join fetch s.auditorium where s.id = :id")
  Optional<Showtime> findDetailById(@Param("id") Long id);

  @Query("select s from Showtime s join fetch s.movie join fetch s.auditorium where s.startTime >= :start and s.startTime < :end order by s.startTime asc")
  List<Showtime> findWithDetailsByStartTimeBetween(@Param("start") Instant start, @Param("end") Instant end);
}
