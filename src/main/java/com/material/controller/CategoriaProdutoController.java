package com.material.controller;

import com.material.model.CategoriaProduto;
import com.material.service.CategoriaProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaProdutoController {

    @Autowired
    private CategoriaProdutoService service;

    @GetMapping
    public ResponseEntity<List<CategoriaProduto>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaProduto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<CategoriaProduto> criar(@RequestBody CategoriaProduto categoria) {
        return ResponseEntity.ok(service.salvar(categoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaProduto> atualizar(@PathVariable Long id, @RequestBody CategoriaProduto categoria) {
        categoria.setId(id);
        return ResponseEntity.ok(service.salvar(categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}