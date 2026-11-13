package com.material.dto;

import java.math.BigDecimal;

public class CarrinhoImpostosDTO {

	private Long transportadoraId;
	private Integer numeroNotaFiscal; // Retorna o número calculado para a tela
	

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
    private BigDecimal valorTotalPedido;
    private BigDecimal valorTotalNota; // Incluído para casar com a 15ª linha do MySQL
    private String serie;
    // Getters e Setters
    
    public Integer getNumeroNotaFiscal() { return numeroNotaFiscal; }
    public void setNumeroNotaFiscal(Integer n) { this.numeroNotaFiscal = n; }

    public Long getTransportadoraId() { return transportadoraId; }
    public void setTransportadoraId(Long t) { this.transportadoraId = t; }

    public String getSerie() { return this.serie; }
    public void setSerie(String serie) { this.serie = serie; }
    
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
