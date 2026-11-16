package com.material.repository;

import com.material.model.ProdutoFarmacia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoFarmaciaRepository extends JpaRepository<ProdutoFarmacia, Long> {
}