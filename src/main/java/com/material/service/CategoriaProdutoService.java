package com.material.service;

import com.material.model.CategoriaProduto;
import com.material.repository.CategoriaProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoriaProdutoService {

    @Autowired
    private CategoriaProdutoRepository repository;

    public List<CategoriaProduto> listarTodas() {
        return repository.findAll();
    }

    public CategoriaProduto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada com ID: " + id));
    }

    public CategoriaProduto salvar(CategoriaProduto categoria) {
        // Força salvar com nome em letras maiúsculas para manter o padrão visual do balcão
        if (categoria.getNome() != null) {
            categoria.setNome(categoria.getNome().trim().toUpperCase());
        }
        return repository.save(categoria);
    }

    public void deletar(Long id) {
        CategoriaProduto categoria = buscarPorId(id);
        repository.delete(categoria);
    }
}