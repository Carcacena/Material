package com.material.repository;

import com.material.model.CategoriaProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaProdutoRepository extends JpaRepository<CategoriaProduto, Long> {
    // Repositório pronto herdando todos os métodos CRUD básicos do JPA
}