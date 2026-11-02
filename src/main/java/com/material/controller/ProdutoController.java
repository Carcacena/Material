package com.material.controller;

import com.material.dto.ProdutoDTO;
import com.material.model.Produto;
import com.material.service.ProdutoService; // 🆕 Importando a camada de serviço ajustada
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService; // 🆕 Injetando o Service para cuidar das regras de negócio

    // ==========================================
    // 💾 CADASTRAR PRODUTO (POST)
    // ==========================================
    @PostMapping
    public ResponseEntity<Produto> cadastrar(@RequestBody ProdutoDTO dto) {
        // O Service agora valida a margem e transfere o estoqueAtual e qteEntrada para o banco
        Produto novoProduto = produtoService.salvarNovo(dto);
        return ResponseEntity.ok(novoProduto);
    }

    // ==========================================
    // 🔍 LISTAR PRODUTOS (GET)
    // ==========================================
    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    // ==========================================
    // 🔄 ATUALIZAR PRODUTO (PUT)
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody ProdutoDTO dto) {
        // O Service atualiza os dados comerciais salvaguardando a consistência do estoque
        Produto produtoAtualizado = produtoService.atualizar(id, dto);
        return ResponseEntity.ok(produtoAtualizado);
    }

    // ==========================================
    // ❌ EXCLUIR PRODUTO (DELETE)
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}