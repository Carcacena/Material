package com.material.repository;

import com.material.model.EntradaMovimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntradaMovimentoRepository
        extends JpaRepository<EntradaMovimento, Long> {

    List<EntradaMovimento>
        findByEntrada_IdOrderByDataMovimentoAsc(Long entradaId);

    List<EntradaMovimento>
        findByEntrada_NumeroNotaOrderByDataMovimentoAsc(String numeroNota);

    boolean existsByEntrada_IdAndTipoMovimento(
        Long entradaId,
        String tipoMovimento
    );
}