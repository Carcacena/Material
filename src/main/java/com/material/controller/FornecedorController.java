package com.material.controller;

import com.material.model.Fornecedor;
import com.material.repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*") // 👈 Adicionado para liberar o acesso do JavaScript local
@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @GetMapping
    public ResponseEntity<List<Fornecedor>> listar() {
        return ResponseEntity.ok(fornecedorRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Fornecedor> cadastrar(@RequestBody Fornecedor fornecedor) {
        return ResponseEntity.ok(fornecedorRepository.save(fornecedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(
            @PathVariable Long id,
            @RequestBody Fornecedor fornecedorDados) {

        return fornecedorRepository.findById(id)
                .map(fornecedor -> {

                    // CPF/CNPJ NÃO ALTERA - permanece o que já está no banco

                    fornecedor.setNome(fornecedorDados.getNome());
                    fornecedor.setInscricaoEstadual(fornecedorDados.getInscricaoEstadual());
                    fornecedor.setEmail(fornecedorDados.getEmail());
                    fornecedor.setTelefone(fornecedorDados.getTelefone());
                    fornecedor.setCep(fornecedorDados.getCep());
                    fornecedor.setUf(fornecedorDados.getUf());
                    fornecedor.setLogradouro(fornecedorDados.getLogradouro());
                    fornecedor.setNumero(fornecedorDados.getNumero());
                    fornecedor.setComplemento(fornecedorDados.getComplemento());
                    fornecedor.setBairro(fornecedorDados.getBairro());
                    fornecedor.setCidade(fornecedorDados.getCidade());

                    Fornecedor atualizado =
                            fornecedorRepository.save(fornecedor);

                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
   

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));

        fornecedorRepository.delete(fornecedor);
        return ResponseEntity.noContent().build();
    }
}