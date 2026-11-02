package com.material.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EntradaPeriodoDTO {
    private Long id;
    private String numeroNota;
    private LocalDate dataRecebimento;
    private String proveedorNome; // Nome do fornecedor
    private BigDecimal valorTotal;

    // Construtor completo para a Query do JPA usar
    public EntradaPeriodoDTO(Long id, String numeroNota, LocalDate dataRecebimento, String proveedorNome, BigDecimal valorTotal) {
        this.id = id;
        this.numeroNota = numeroNota;
        this.dataRecebimento = dataRecebimento;
        this.proveedorNome = proveedorNome;
        this.valorTotal = valorTotal != null ? valorTotal : BigDecimal.ZERO;
    }

    // Getters obrigatórios para o Jackson converter em JSON para o Front-end
    public Long getId() { return id; }
    public String getNumeroNota() { return numeroNota; }
    public LocalDate getDataRecebimento() { return dataRecebimento; }
    public String getFornecedorNome() { return proveedorNome; }
    public BigDecimal getValorTotal() { return valorTotal; }
}