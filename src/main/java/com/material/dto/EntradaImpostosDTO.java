package com.material.dto;

import java.math.BigDecimal;

public class EntradaImpostosDTO {

    private BigDecimal baseCalculoIcms;
    private BigDecimal valorIcms;
    private BigDecimal baseCalculoIcmsSt;
    private BigDecimal valorIcmsSt;
    private BigDecimal valorTotalProdutos;
    private BigDecimal valorFrete;
    private BigDecimal valorSeguro;
    private BigDecimal valorDesconto;
    private BigDecimal outrasDespesasAcessorias;
    private BigDecimal valorIpi;
    private BigDecimal valorTotalNota;

    // Getters e Setters
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