package com.material.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.material.dto.CarrinhoImpostosDTO;
import com.material.model.CarrinhoImpostos;

import com.material.service.CarrinhoImpostosService;


@CrossOrigin("*")
@RestController
@RequestMapping("/api/carrinhos/{carrinhoId}/impostos")

public class CarrinhoImpostosController {
	
	 @Autowired
	    private CarrinhoImpostosService carrinhoImpostosService;

	    // 🔍 Busca os impostos já lançados dessa nota
	    @GetMapping
	    public ResponseEntity<?> buscar(@PathVariable Long carrinhoId) {
	        try {
	            CarrinhoImpostos impostos = carrinhoImpostosService.buscarPorCarrinho(carrinhoId);
	            return ResponseEntity.ok(impostos);
	        } catch (RuntimeException e) {
	            return ResponseEntity.noContent().build();
	        }
	    }

	    // 💾 Salva ou atualiza os impostos da nota
	    @PostMapping
	    public ResponseEntity<?> salvar(@PathVariable Long carrinhoId, @RequestBody CarrinhoImpostosDTO dto) {
	        try {
	           CarrinhoImpostos salvo = carrinhoImpostosService.salvarOuAtualizar(carrinhoId, dto);
	            return ResponseEntity.ok(salvo);
	        } catch (RuntimeException e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }
	}

	
	

