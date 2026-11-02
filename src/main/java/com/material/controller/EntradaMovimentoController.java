package com.material.controller;

import com.material.dto.EntradaMovimentoDTO;
import com.material.service.EntradaMovimentoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/entradas")
public class EntradaMovimentoController {

    @Autowired
    private EntradaMovimentoService entradaMovimentoService;

    // Histórico pelo ID da entrada
    @GetMapping("/{entradaId}/movimentos")
    public ResponseEntity<List<EntradaMovimentoDTO>>
            listarPorEntrada(
                    @PathVariable Long entradaId) {

        return ResponseEntity.ok(
            entradaMovimentoService
                .listarPorEntrada(entradaId)
        );
    }

    // Histórico pelo número da NF
    @GetMapping("/nota/{numeroNota}/movimentos")
    public ResponseEntity<List<EntradaMovimentoDTO>>
            listarPorNumeroNota(
                    @PathVariable String numeroNota) {

        return ResponseEntity.ok(
            entradaMovimentoService
                .listarPorNumeroNota(numeroNota)
        );
    }
}