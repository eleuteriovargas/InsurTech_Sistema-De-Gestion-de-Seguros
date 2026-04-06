package com.vargas.insurtech.presentation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "application", "Insurance Management System",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/info")
    @Operation(summary = "Application info")
    public ResponseEntity<Map<String, Object>> info() {
        return ResponseEntity.ok(Map.of(
                "name", "Insurance Management System",
                "version", "1.0.0-SNAPSHOT",
                "architecture", "Hexagonal (Ports & Adapters)",
                "javaVersion", System.getProperty("java.version")
        ));
    }
}
