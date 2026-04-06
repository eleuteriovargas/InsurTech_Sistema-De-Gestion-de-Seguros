package com.vargas.insurtech.config;

import com.vargas.insurtech.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/health/**", "/info").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()

                        // Admin only - user management
                        .requestMatchers("/auth/mi-password").authenticated()
                        .requestMatchers("/auth/register").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/auth/usuarios/**").hasAuthority("ROLE_ADMIN")

                        // Portal Cliente - solo CUSTOMER
                        .requestMatchers("/portal/**").hasAuthority("ROLE_CUSTOMER")

                        // Asegurados
                        .requestMatchers(HttpMethod.POST, "/asegurados/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/asegurados/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/asegurados/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/asegurados/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")

                        // Polizas
                        .requestMatchers(HttpMethod.POST, "/polizas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")
                        .requestMatchers(HttpMethod.PUT, "/polizas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")
                        .requestMatchers(HttpMethod.PATCH, "/polizas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")
                        .requestMatchers(HttpMethod.DELETE, "/polizas/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/polizas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")

                        // Siniestros
                        .requestMatchers(HttpMethod.PUT, "/siniestros/*/evaluar").hasAnyAuthority("ROLE_ADMIN", "ROLE_EVALUATOR")
                        .requestMatchers(HttpMethod.PATCH, "/siniestros/*/evaluar").hasAnyAuthority("ROLE_ADMIN", "ROLE_EVALUATOR")
                        .requestMatchers(HttpMethod.POST, "/siniestros/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT")
                        .requestMatchers(HttpMethod.GET, "/siniestros/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AGENT", "ROLE_EVALUATOR")

                        // Primas y Pagos
                        .requestMatchers("/primas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE")
                        .requestMatchers("/pagos/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE")

                        // Reportes
                        .requestMatchers("/reportes/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
