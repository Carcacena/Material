package com.material.controller;

import com.material.model.LogSistema;
import com.material.repository.LogSistemaRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogSistemaController {

    private final LogSistemaRepository repository;

    public LogSistemaController(LogSistemaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<LogSistema>> listarLogs() {
        return ResponseEntity.ok(
                repository.findAllByOrderByDataHoraDesc()
        );
    }
}