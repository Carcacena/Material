package com.material.controller;

import com.material.dto.EntradaImpostosDTO;
import com.material.model.EntradaImpostos;
import com.material.service.EntradaImpostosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/entradas/{entradaId}/impostos")
public class EntradaImpostosController {

    @Autowired
    private EntradaImpostosService entradaImpostosService;

    // 🔍 Busca os impostos já lançados dessa nota
    @GetMapping
    public ResponseEntity<?> buscar(@PathVariable Long entradaId) {
        try {
            EntradaImpostos impostos = entradaImpostosService.buscarPorEntrada(entradaId);
            return ResponseEntity.ok(impostos);
        } catch (RuntimeException e) {
            return ResponseEntity.noContent().build();
        }
    }

    // 💾 Salva ou atualiza os impostos da nota
    @PostMapping
    public ResponseEntity<?> salvar(@PathVariable Long entradaId, @RequestBody EntradaImpostosDTO dto) {
        try {
            EntradaImpostos salvo = entradaImpostosService.salvarOuAtualizar(entradaId, dto);
            return ResponseEntity.ok(salvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}