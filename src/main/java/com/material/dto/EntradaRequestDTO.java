package com.material.dto;

import java.time.LocalDate;
import java.util.List;

public class EntradaRequestDTO {
    private String numeroNota;
    private String serie;
    private String chaveAcesso;
    
    // 💡 PASSO CONQUISTADO: Garante que toda nova nota nasça com Status 1 (Ativa/Estoque) por padrão
    private Integer status = 1; 

    private LocalDate dataRecebimento;
    private Long fornecedorId;
    private List<ItemEntradaDTO> itens;

    // =========================================================================
    // CONSTRUTORES (Padrão e Completo)
    // =========================================================================
    public EntradaRequestDTO() {
    }

    public EntradaRequestDTO(String numeroNota, String serie, String chaveAcesso, Integer status, 
                             LocalDate dataRecebimento, Long fornecedorId, List<ItemEntradaDTO> itens) {
        this.numeroNota = numeroNota;
        this.serie = serie;
        this.chaveAcesso = chaveAcesso;
        this.status = (status != null) ? status : 1; // Proteção se vier nulo do front
        this.dataRecebimento = dataRecebimento;
        this.fornecedorId = fornecedorId;
        this.itens = itens;
    }

    // =========================================================================
    // GETTERS E SETTERS (Essenciais para o Jackson converter o JSON)
    // =========================================================================
    public String getNumeroNota() { return numeroNota; }
    public void setNumeroNota(String numeroNota) { this.numeroNota = numeroNota; }

    public String getSerie() { return serie; }
    public void setSerie(String serie) { this.serie = serie; }

    public String getChaveAcesso() { return chaveAcesso; }
    public void setChaveAcesso(String chaveAcesso) { this.chaveAcesso = chaveAcesso; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public LocalDate getDataRecebimento() { return dataRecebimento; }
    public void setDataRecebimento(LocalDate dataRecebimento) { this.dataRecebimento = dataRecebimento; }

    public Long getFornecedorId() { return fornecedorId; }
    public void setFornecedorId(Long fornecedorId) { this.fornecedorId = fornecedorId; }

    public List<ItemEntradaDTO> getItens() { return itens; }
    public void setItens(List<ItemEntradaDTO> itens) { this.itens = itens; }
}