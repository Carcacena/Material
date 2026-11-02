package com.material.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.material.dto.BaixaContaPagarDTO;
import com.material.dto.ContaPagarDTO;
import com.material.dto.GerarContasPagarDTO;
import com.material.service.ContaPagarService;

@RestController
@RequestMapping("/contas-pagar")
public class ContaPagarController {

    private final ContaPagarService service;

    public ContaPagarController(
            ContaPagarService service) {

        this.service = service;
    }

    @GetMapping
    public List<ContaPagarDTO> listar() {

        return service.listar();
    }

    @GetMapping("/fornecedor/{fornecedorId}")
    public List<ContaPagarDTO> porFornecedor(
            @PathVariable Long fornecedorId) {

        return service.porFornecedor(
            fornecedorId
        );
    }

    @GetMapping("/nota/{numero}/{serie}")
    public List<ContaPagarDTO> porNota(
            @PathVariable Integer numero,
            @PathVariable String serie) {

        return service.porNota(
            numero,
            serie
        );
    }

    @PostMapping("/gerar")
    public ResponseEntity<List<ContaPagarDTO>>
            gerar(
                @RequestBody
                GerarContasPagarDTO dto) {

        return ResponseEntity.ok(
            service.gerarTitulos(dto)
        );
    }

    @PutMapping("/{id}/baixar")
    public ResponseEntity<ContaPagarDTO>
            baixar(
                @PathVariable Long id,
                @RequestBody
                BaixaContaPagarDTO dto) {

        return ResponseEntity.ok(
            service.baixar(id, dto)
        );
    }

    @PutMapping("/entrada/{numeroEntrada}/cancelar")
    public ResponseEntity<Void> cancelarPorEntrada(
            @PathVariable String numeroEntrada,
            @RequestParam(
                defaultValue = "Cancelamento da entrada"
            )
            String motivo) {

        service.cancelarPorEntrada(
            numeroEntrada,
            motivo
        );

        return ResponseEntity.ok().build();
    }
}