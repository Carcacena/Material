package com.material.repository;

import com.material.model.EntradaImpostos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Optional;

public interface EntradaImpostosRepository extends JpaRepository<EntradaImpostos, Long> {
    
    Optional<EntradaImpostos> findByEntrada_Id(Long entradaId);

    // 🎯 CORREÇÃO CIRÚRGICA: SQL Nativo batendo direto nas tabelas físicas do MySQL
    @Query(value = "SELECT COALESCE(SUM(ei.valor_total_nota), 0), COALESCE(SUM(ei.valor_icms), 0), COALESCE(SUM(ei.valor_ipi), 0) " +
                   "FROM entrada_impostos ei " +
                   "INNER JOIN entrada e ON ei.entrada_id = e.id " +
               //    "WHERE e.data_criacao BETWEEN :inicio AND :fim", nativeQuery = true)
               "WHERE e.data_recebimento BETWEEN :inicio AND :fim", nativeQuery = true)
               Object somarImpostosPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}