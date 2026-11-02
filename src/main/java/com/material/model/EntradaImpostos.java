package com.material.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "entrada_impostos")
public class EntradaImpostos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "entrada_id", nullable = false, unique = true)
    @JsonIgnore
    private Entrada entrada;

    @Column(name = "base_calculo_icms", precision = 12, scale = 2)
    private BigDecimal baseCalculoIcms;

    @Column(name = "valor_icms", precision = 12, scale = 2)
    private BigDecimal valorIcms;

    @Column(name = "base_calculo_icms_st", precision = 12, scale = 2)
    private BigDecimal baseCalculoIcmsSt;

    @Column(name = "valor_icms_st", precision = 12, scale = 2)
    private BigDecimal valorIcmsSt;

    @Column(name = "valor_total_produtos", precision = 12, scale = 2)
    private BigDecimal valorTotalProdutos;

    @Column(name = "valor_frete", precision = 12, scale = 2)
    private BigDecimal valorFrete;

    @Column(name = "valor_seguro", precision = 12, scale = 2)
    private BigDecimal valorSeguro;

    @Column(name = "valor_desconto", precision = 12, scale = 2)
    private BigDecimal valorDesconto;

    @Column(name = "outras_despesas_acessorias", precision = 12, scale = 2)
    private BigDecimal outrasDespesasAcessorias;

    @Column(name = "valor_ipi", precision = 12, scale = 2)
    private BigDecimal valorIpi;

    @Column(name = "valor_total_nota", precision = 12, scale = 2)
    private BigDecimal valorTotalNota;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Entrada getEntrada() { return entrada; }
    public void setEntrada(Entrada entrada) { this.entrada = entrada; }
    public BigDecimal getBaseCalculoIcms() { return baseCalculoIcms; }
    public void setBaseCalculoIcms(BigDecimal v) { this.baseCalculoIcms = v; }
    public BigDecimal getValorIcms() { return valorIcms; }
    public void setValorIcms(BigDecimal v) { this.valorIcms = v; }
    public BigDecimal getBaseCalculoIcmsSt() { return baseCalculoIcmsSt; }
    public void setBaseCalculoIcmsSt(BigDecimal v) { this.baseCalculoIcmsSt = v; }
    public BigDecimal getValorIcmsSt() { return valorIcmsSt; }
    public void setValorIcmsSt(BigDecimal v) { this.valorIcmsSt = v; }
    public BigDecimal getValorTotalProdutos() { return valorTotalProdutos; }
    public void setValorTotalProdutos(BigDecimal v) { this.valorTotalProdutos = v; }
    public BigDecimal getValorFrete() { return valorFrete; }
    public void setValorFrete(BigDecimal v) { this.valorFrete = v; }
    public BigDecimal getValorSeguro() { return valorSeguro; }
    public void setValorSeguro(BigDecimal v) { this.valorSeguro = v; }
    public BigDecimal getValorDesconto() { return valorDesconto; }
    public void setValorDesconto(BigDecimal v) { this.valorDesconto = v; }
    public BigDecimal getOutrasDespesasAcessorias() { return outrasDespesasAcessorias; }
    public void setOutrasDespesasAcessorias(BigDecimal v) { this.outrasDespesasAcessorias = v; }
    public BigDecimal getValorIpi() { return valorIpi; }
    public void setValorIpi(BigDecimal v) { this.valorIpi = v; }
    public BigDecimal getValorTotalNota() { return valorTotalNota; }
    public void setValorTotalNota(BigDecimal v) { this.valorTotalNota = v; }
}