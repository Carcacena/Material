package com.material.controller;

import com.material.model.Cliente;
import com.material.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/clientes") // ⚡ ADICIONADO O /api AQUI!
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    // 🟢 CADASTRAR NOVO CLIENTE (POST)
    @PostMapping
    public ResponseEntity<Cliente> cadastrar(@RequestBody Cliente cliente) {
        // Salva o cliente vindo direto do JSON do front-end
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    // 📦 LISTAR TODOS OS CLIENTES (GET)
    @GetMapping
    public ResponseEntity<List<Cliente>> listar() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

  
 // 🔵 ATUALIZAR CLIENTE EXISTENTE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(
            @PathVariable Long id,
            @RequestBody Cliente clienteDados) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cliente não encontrado"));

        cliente.setNome(clienteDados.getNome());
        cliente.setInscricaoEstadual(clienteDados.getInscricaoEstadual());
        cliente.setEmail(clienteDados.getEmail());
        cliente.setTelefone(clienteDados.getTelefone());

        cliente.setCep(clienteDados.getCep());
        cliente.setLogradouro(clienteDados.getLogradouro());
        cliente.setNumero(clienteDados.getNumero());
        cliente.setComplemento(clienteDados.getComplemento());
        cliente.setBairro(clienteDados.getBairro());
        cliente.setCidade(clienteDados.getCidade());
        cliente.setUf(clienteDados.getUf());

        // CPF/CNPJ NÃO É ALTERADO
        // cliente.setCnpj(clienteDados.getCnpj());

        Cliente clienteAtualizado = clienteRepository.save(cliente);

        return ResponseEntity.ok(clienteAtualizado);
    }

    // 🔴 EXCLUIR CLIENTE DO BANCO (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        clienteRepository.delete(cliente);
        return ResponseEntity.noContent().build();
    }
}