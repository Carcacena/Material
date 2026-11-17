package com.material.repository;

import com.material.model.ImagemProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ImagemProdutoRepository extends JpaRepository<ImagemProduto, Long> {
    Optional<ImagemProduto> findByProdutoId(Long produtoId);
}