package com.mrs.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

import com.mrs.backend.security.JwtAuthFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  private final JwtAuthFilter jwtAuthFilter;

  public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
    this.jwtAuthFilter = jwtAuthFilter;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .cors(cors -> {
        })
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/health").permitAll()
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers("/error").permitAll()
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/genres").permitAll()
            .requestMatchers("/api/movies").permitAll()
            .requestMatchers("/api/movies/*").permitAll()
            .requestMatchers("/api/movies/*/showtimes").permitAll()
            .requestMatchers("/api/admin/**").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/showtimes/{id}").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/showtimes/*").permitAll()
            .requestMatchers(new RegexRequestMatcher("^/api/showtimes/\\d+$", HttpMethod.GET.name())).permitAll()
            .requestMatchers("/api/showtimes/*/seats").permitAll()
            .requestMatchers("/api/showtimes/*/availability").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource(
      @Value("${app.cors.allowed-origins:http://localhost:5173}") String allowedOrigins) {
    CorsConfiguration cfg = new CorsConfiguration();
    List<String> origins = Arrays.stream(allowedOrigins.split(","))
        .map(String::trim)
        .filter(s -> !s.isBlank())
        .toList();
    cfg.setAllowedOrigins(origins);
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
    cfg.setExposedHeaders(List.of("Authorization"));
    cfg.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
