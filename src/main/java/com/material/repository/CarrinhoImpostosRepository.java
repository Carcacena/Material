package com.material.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.material.model.CarrinhoImpostos;

public interface CarrinhoImpostosRepository extends JpaRepository<CarrinhoImpostos, Long> {
	
    // 🎯 Busca existente para casar com o CarrinhoController
    Optional<CarrinhoImpostos> findByCarrinho_Id(Long carrinhoId); 
	
    // 🧾 NOVA QUERY: Soma os totais de notas, ICMS e IPI dos Cupons de Venda faturados (status = 1) no período
    @Query("SELECT SUM(ci.valorTotalNota), SUM(ci.valorIcms), SUM(ci.valorIpi) " +
           "FROM CarrinhoImpostos ci JOIN ci.carrinho c " +
           "WHERE c.dataCriacao BETWEEN :inicio AND :fim AND c.status = 1")
    Object somarImpostosPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}