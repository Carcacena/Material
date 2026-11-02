package com.material.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.material.dto.EntradaPeriodoDTO;
import com.material.model.Entrada;

@Repository
public interface EntradaRepository extends JpaRepository<Entrada, Long> {

    @Query("SELECT new com.material.dto.EntradaPeriodoDTO(e.id, e.numeroNota, e.dataRecebimento, f.nome, i.valorTotalNota) " +
           "FROM Entrada e " +
           "JOIN e.fornecedor f " +
           "LEFT JOIN EntradaImpostos i ON i.entrada.id = e.id " +
           "WHERE e.dataRecebimento BETWEEN :inicio AND :fim " +
           "ORDER BY e.dataRecebimento DESC")
    List<EntradaPeriodoDTO> buscarEntradasPorPeriodo(
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);

    // 🔄 Localiza a entrada para devolução
    Optional<Entrada> findByNumeroNota(String numeroNota);
    // 🎯 Versão garantida: Usa o mesmo JOIN manual que funciona no seu sistema
    // 🎯 Consulta que une a árvore de tabelas: Entrada -> Fornecedor -> EntradaImpostos
    @Query("SELECT e.id, e.numeroNota, f.nome, i.valorTotalNota " +
            "FROM Entrada e " +
            "JOIN e.fornecedor f " +
            "LEFT JOIN EntradaImpostos i ON i.entrada.id = e.id " +
            "WHERE e.status = :status")
     List<Object[]> findNotasAtivasResumoComValor(@Param("status") Integer status);
    
    
}