package com.material.service;

import com.material.dto.EntradaMovimentoDTO;
import com.material.model.Entrada;
import com.material.model.EntradaMovimento;
import com.material.repository.EntradaMovimentoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EntradaMovimentoService {

    @Autowired
    private EntradaMovimentoRepository entradaMovimentoRepository;

    // ==========================================
    // GRAVA MOVIMENTO DE ENTRADA
    // ==========================================
    @Transactional
    public void registrarEntrada(Entrada entrada) {

        registrarMovimento(
            entrada,
            1,
            "ENTRADA"
        );
    }

    // ==========================================
    // GRAVA MOVIMENTO DE DEVOLUÇÃO
    // ==========================================
    @Transactional
    public void registrarDevolucao(Entrada entrada) {

        registrarMovimento(
            entrada,
            2,
            "DEVOLUCAO"
        );
    }

    // ==========================================
    // MÉTODO INTERNO
    // ==========================================
    private void registrarMovimento(
            Entrada entrada,
            Integer status,
            String tipoMovimento) {

        boolean jaExiste =
            entradaMovimentoRepository
                .existsByEntrada_IdAndTipoMovimento(
                    entrada.getId(),
                    tipoMovimento
                );

        if (jaExiste) {
            return;
        }

        EntradaMovimento movimento =
                new EntradaMovimento();

        movimento.setEntrada(entrada);
        movimento.setStatus(status);
        movimento.setTipoMovimento(tipoMovimento);
        movimento.setDataMovimento(LocalDateTime.now());

        entradaMovimentoRepository.save(movimento);
    }

    // ==========================================
    // LISTA PELO ID DA ENTRADA
    // ==========================================
    @Transactional(readOnly = true)
    public List<EntradaMovimentoDTO> listarPorEntrada(
            Long entradaId) {

        return entradaMovimentoRepository
                .findByEntrada_IdOrderByDataMovimentoAsc(
                    entradaId
                )
                .stream()
                .map(this::converterDTO)
                .toList();
    }

    // ==========================================
    // LISTA PELO NÚMERO DA NOTA
    // ==========================================
    @Transactional(readOnly = true)
    public List<EntradaMovimentoDTO> listarPorNumeroNota(
            String numeroNota) {

        return entradaMovimentoRepository
                .findByEntrada_NumeroNotaOrderByDataMovimentoAsc(
                    numeroNota
                )
                .stream()
                .map(this::converterDTO)
                .toList();
    }

    // ==========================================
    // ENTITY -> DTO
    // ==========================================
    private EntradaMovimentoDTO converterDTO(
            EntradaMovimento movimento) {

        return new EntradaMovimentoDTO(
            movimento.getId(),
            movimento.getEntrada().getId(),
            movimento.getEntrada().getNumeroNota(),
            movimento.getStatus(),
            movimento.getTipoMovimento(),
            movimento.getDataMovimento()
        );
    }
}