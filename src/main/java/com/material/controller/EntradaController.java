package com.material.controller;

import com.material.dto.EntradaRequestDTO;
import com.material.model.Entrada;
import com.material.model.Fornecedor;
import com.material.repository.FornecedorRepository;
import com.material.service.EntradaService;
import jakarta.validation.Valid;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/entradas")
public class EntradaController {

    @Autowired
    private EntradaService entradaService;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    // 🚀 Ajustado para bater com seu JS (Caso mude a rota na função carregarFornecedores para /api/entradas/fornecedores)
    @GetMapping("/fornecedores")
    public ResponseEntity<List<Fornecedor>> listarFornecedoresParaEntrada() {
        return ResponseEntity.ok(fornecedorRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> criarEntrada(@Valid @RequestBody EntradaRequestDTO entradaRequestDTO) {
        try {
            Entrada novaEntrada = entradaService.registrarEntrada(entradaRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaEntrada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao processar a entrada de estoque.");
        }
    }
   
    @PutMapping("/devolver-nota/{numeroNota}")
    public ResponseEntity<?> devolverNota(@PathVariable String numeroNota) {
        try {
            Entrada entradaDevolvida = entradaService.devolverNota(numeroNota);
            return ResponseEntity.ok(entradaDevolvida);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
   
    @GetMapping("/ativas-resumo")
    public ResponseEntity<?> listarNotasAtivasParaEstorno() {
        try {
            var resumo = entradaService.listarNotasAtivasResumo();
            return ResponseEntity.ok(resumo);
        } catch (Exception e) {
            System.out.println("Erro na API Java: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ==========================================
    // ✨ NOVOS ENDPOINTS: CONEXÃO COM O PAINEL GERENCIAL FLUTUANTE
    // ==========================================

    // 🔍 1. Rota que filtra as Notas por Data no Painel
    @GetMapping("/filtrar")
    public ResponseEntity<?> filtrarEntradasPorPeriodo(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        try {
            return ResponseEntity.ok(entradaService.buscarEntradasPorPeriodo(inicio, fim));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao filtrar notas: " + e.getMessage());
        }
    }

    // 📋 2. Rota que preenche a tabela de itens do Painel quando clica na nota
    @GetMapping("/{id}/itens") // Rota final: /api/entradas/{id}/itens
    public ResponseEntity<?> obterItensDaEntrada(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(entradaService.buscarItensDaEntrada(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro no Java: " + e.getMessage());
        }
    }
   
    // ↩️ 3. Rota de estorno por ID seguro disparado de dentro do Painel Gerencial
    @PostMapping("/estornar/{id}")
    public ResponseEntity<?> estornarNotaPorId(@PathVariable Long id) {
        try {
            Entrada entradaEstornada = entradaService.estornarEntrada(id);
            return ResponseEntity.ok(entradaEstornada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao processar estorno: " + e.getMessage());
        }
    }
   
   
}