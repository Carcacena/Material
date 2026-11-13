package com.material.controller;

import com.material.model.LogSistema;
import com.material.repository.LogSistemaRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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

    // 🗑️ EXCLUIR SELETIVO (Apaga apenas os IDs marcados na tela)
    @DeleteMapping("/lote")
    @Transactional
    public ResponseEntity<Void> excluirSelecionados(@RequestBody List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            repository.deleteAllByIdInBatch(ids);
        }
        return ResponseEntity.noContent().build();
    }

    // 🧹 ESVAZIAR LIXEIRA (Apaga todos os logs do sistema)
    @DeleteMapping("/esvaziar")
    @Transactional
    public ResponseEntity<Void> esvaziarLixeira() {
        repository.deleteAllInBatch();
        return ResponseEntity.noContent().build();
    }
}