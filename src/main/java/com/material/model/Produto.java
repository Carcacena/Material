package com.material.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "a_granel", nullable = false)
    private Boolean aGranel = false;

    @Column(name = "preco_custo", precision = 10, scale = 2)
    private BigDecimal precoCusto;

    @Column(name = "preco_venda", precision = 10, scale = 2)
    private BigDecimal precoVenda;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Column(name = "qte_entrada", nullable = false)
    private int qteEntrada;

    @Column(name = "estoque_atual", nullable = false)
    private int estoqueAtual;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "estoque", nullable = false, precision = 10, scale = 3)
    private BigDecimal estoque = BigDecimal.ZERO;

    // ======================
    // CAMPOS CALCULADOS
    // ======================
    @Transient
    public BigDecimal getLucro() {
        if (precoCusto == null || precoVenda == null) {
            return BigDecimal.ZERO;
        }
        return precoVenda.subtract(precoCusto);
    }

    @Transient
    public BigDecimal getMargemLucro() {
        if (precoCusto == null || precoVenda == null || precoCusto.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return precoVenda
                .subtract(precoCusto)
                .divide(precoCusto, 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    @Transient
    public boolean isProximoVencimento() {
        if (dataValidade == null) {
            return false;
        }
        LocalDate hoje = LocalDate.now();
        return !dataValidade.isBefore(hoje) && dataValidade.isBefore(hoje.plusDays(31));
    }

    // ======================
    // GETTERS E SETTERS
    // ======================
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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

    public Fornecedor getFornecedor() {
        return fornecedor;
    }

    public void setFornecedor(Fornecedor fornecedor) {
        this.fornecedor = fornecedor;
    }

    public BigDecimal getEstoque() {
        return estoque;
    }

    public void setEstoque(BigDecimal estoque) {
        this.estoque = estoque;
    }

    // 🆕 NOVOS: Métodos adicionados para o controle das novas colunas
    public int getQteEntrada() {
        return qteEntrada;
    }

    public void setQteEntrada(int qteEntrada) {
        this.qteEntrada = qteEntrada;
    }

    public int getEstoqueAtual() {
        return estoqueAtual;
    }

    public void setEstoqueAtual(int estoqueAtual) {
        this.estoqueAtual = estoqueAtual;
    }
}