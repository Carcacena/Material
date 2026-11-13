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

import com.material.dto.BaixaContaReceberDTO;
import com.material.dto.ContaReceberDTO;
import com.material.dto.GerarContasReceberDTO;
import com.material.service.ContaReceberService;

@RestController
@RequestMapping("/contas-receber")
public class ContaReceberController {
	
	
	  private final ContaReceberService service;

	    public ContaReceberController(
	            ContaReceberService service) {

	        this.service = service;
	    }

	    @GetMapping
	    public List<ContaReceberDTO> listar() {

	        return service.listar();
	    }

	    @GetMapping("/cliente/{clienteId}")
	    public List<ContaReceberDTO> porCliente(
	            @PathVariable Long clienteId) {

	        return service.porCliente(
	            clienteId
	        );
	    }

	    @GetMapping("/nota/{numero}/{serie}")
	    public List<ContaReceberDTO> porNota(
	            @PathVariable Integer numero,
	            @PathVariable String serie) {

	        return service.porNota(
	            numero,
	            serie
	        );
	    }

	    /*
	     * Endpoint experimental.
	     * Depois o faturamento definitivo
	     * deverá chamar o Service diretamente.
	     */
	    @PostMapping("/gerar")
	    public ResponseEntity<List<ContaReceberDTO>>
	            gerar(
	                @RequestBody
	                GerarContasReceberDTO dto) {

	        return ResponseEntity.ok(
	            service.gerarTitulos(dto)
	        );
	    }

	    @PutMapping("/{id}/baixar")
	    public ResponseEntity<ContaReceberDTO>
	            baixar(
	                @PathVariable Long id,
	                @RequestBody
	                BaixaContaReceberDTO dto) {

	        return ResponseEntity.ok(
	            service.baixar(id, dto)
	        );
	    }

	    @PutMapping("/pedido/{numeroPedido}/devolver")
	    public ResponseEntity<Void> devolverPorPedido(
	            @PathVariable String numeroPedido) {

	        service.marcarDevolucaoPorPedido(
	            numeroPedido,
	            "Devolução total do pedido"
	        );

	        return ResponseEntity.ok().build();
	    }
	    
	    
	    
	    @PutMapping(
	        "/nota/{numero}/{serie}/cliente/{clienteId}/devolver"
	    )
	    public ResponseEntity<Void>
	            devolver(
	                @PathVariable Integer numero,
	                @PathVariable String serie,
	                @PathVariable Long clienteId,
	                @RequestParam(
	                    defaultValue = "Devolução da venda"
	                )
	                String motivo) {

	        service.marcarDevolucao(
	            numero,
	            serie,
	            clienteId,
	            motivo
	        );

	        return ResponseEntity.ok().build();
	    }
	}

