package com.material.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.material.dto.CarrinhoMovimentoDTO;
import com.material.dto.EntradaMovimentoDTO;
import com.material.service.CarrinhoMovimentoService;
import com.material.service.EntradaMovimentoService;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/carrinho")

public class CarrinhoMovimentoController {

	
	  @Autowired
	    private CarrinhoMovimentoService carrinhoMovimentoService;


	 // =========================================================================
	    // 📄 HISTÓRICO PELO NÚMERO DA NF-E (Sincronizado com o Índice Fiscal)
	    // =========================================================================
	    @GetMapping("/nota/{numeroNota}/movimentos")
	    public ResponseEntity<List<CarrinhoMovimentoDTO>> listarPorNumeroNota(@PathVariable String numeroNota) {
	        
	        // 🌟 CONVERSÃO FISCAL: Limpa o texto vindo da URL e converte para Integer
	        int notaConvertidaNum = (numeroNota != null && !numeroNota.trim().isEmpty()) 
	                                ? Integer.parseInt(numeroNota.replaceAll("\\D", "")) 
	                                : 0;

	        // Chama o seu service usando o nosso método de Índice Fiscal que limpamos na lousa anterior
	        return ResponseEntity.ok(
	            carrinhoMovimentoService.listarPorNotaFiscal(notaConvertidaNum)
	        );
	    }
	}
	


