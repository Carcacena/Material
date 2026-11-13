package com.material.dto;

import java.time.LocalDateTime;

public class EntradaMovimentoDTO {

    private Long id;
    private Long entradaId;
    private String numeroNota;
    private Integer status;
    private String tipoMovimento;
    private LocalDateTime dataMovimento;

    public EntradaMovimentoDTO() {
    }

    public EntradaMovimentoDTO(
            Long id,
            Long entradaId,
            String numeroNota,
            Integer status,
            String tipoMovimento,
            LocalDateTime dataMovimento) {

        this.id = id;
        this.entradaId = entradaId;
        this.numeroNota = numeroNota;
        this.status = status;
        this.tipoMovimento = tipoMovimento;
        this.dataMovimento = dataMovimento;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEntradaId() {
        return entradaId;
    }

    public void setEntradaId(Long entradaId) {
        this.entradaId = entradaId;
    }

    public String getNumeroNota() {
        return numeroNota;
    }

    public void setNumeroNota(String numeroNota) {
        this.numeroNota = numeroNota;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getTipoMovimento() {
        return tipoMovimento;
    }

    public void setTipoMovimento(String tipoMovimento) {
        this.tipoMovimento = tipoMovimento;
    }

    public LocalDateTime getDataMovimento() {
        return dataMovimento;
    }

    public void setDataMovimento(LocalDateTime dataMovimento) {
        this.dataMovimento = dataMovimento;
    }
}