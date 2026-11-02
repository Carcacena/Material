package com.material.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProdutoDTO {

    private String nome;
    private Long fornecedorId;
    private Boolean aGranel;
    private BigDecimal precoCusto;
    private BigDecimal precoVenda;
    private LocalDate dataValidade;
    
    // 🆕 NOVO: Variável adicionada para casar com o JSON enviado pelo front-end
    private int estoqueAtual;

    // ==========================
    // GETTERS E SETTERS
    // ==========================
    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Long getFornecedorId() {
        return fornecedorId;
    }

    public void setFornecedorId(Long fornecedorId) {
        this.fornecedorId = fornecedorId;
    }

    public Boolean getAGranel() {
        return aGranel;
    }

    public void setAGranel(Boolean aGranel) {
        this.aGranel = aGranel;
    }

    public BigDecimal getPrecoCusto() {
        return precoCusto;
    }

    public void setPrecoCusto(BigDecimal precoCusto) {
        this.precoCusto = precoCusto;
    }

    public BigDecimal getPrecoVenda() {
        return precoVenda;
    }

    public void setPrecoVenda(BigDecimal precoVenda) {
        this.precoVenda = precoVenda;
    }

    public LocalDate getDataValidade() {
        return dataValidade;
    }

    public void setDataValidade(LocalDate dataValidade) {
        this.dataValidade = dataValidade;
    }

    // 🆕 NOVOS: Métodos de acesso para o controle de estoque
    public int getEstoqueAtual() {
        return estoqueAtual;
    }

    public void setEstoqueAtual(int estoqueAtual) {
        this.estoqueAtual = estoqueAtual;
    }
}