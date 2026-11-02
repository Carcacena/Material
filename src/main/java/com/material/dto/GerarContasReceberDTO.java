package com.material.dto;

import java.math.BigDecimal;
import java.util.List;

public class GerarContasReceberDTO {
	
	
	private String numeroPedido;
    private Long clienteId;

    private Integer numeroNotaFiscal;
    private String serie;

    private BigDecimal valorFinalCorrigido;

    private String formaPagamento;

    private BigDecimal inpcAnualAplicado;

    private Integer totalParcelas;

    private String cartaoBandeira;
    private String cartaoFinal;
    private String cartaoAutorizacao;
    private String cartaoNsu;

    private String chavePix;

    private List<ParcelaContaReceberDTO> parcelas;

    public String getNumeroPedido() {
        return numeroPedido;
    }

    public void setNumeroPedido(String numeroPedido) {
        this.numeroPedido = numeroPedido;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public Integer getNumeroNotaFiscal() {
        return numeroNotaFiscal;
    }

    public void setNumeroNotaFiscal(Integer numeroNotaFiscal) {
        this.numeroNotaFiscal = numeroNotaFiscal;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public BigDecimal getValorFinalCorrigido() {
        return valorFinalCorrigido;
    }

    public void setValorFinalCorrigido(BigDecimal valorFinalCorrigido) {
        this.valorFinalCorrigido = valorFinalCorrigido;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public BigDecimal getInpcAnualAplicado() {
        return inpcAnualAplicado;
    }

    public void setInpcAnualAplicado(BigDecimal inpcAnualAplicado) {
        this.inpcAnualAplicado = inpcAnualAplicado;
    }

    public Integer getTotalParcelas() {
        return totalParcelas;
    }

    public void setTotalParcelas(Integer totalParcelas) {
        this.totalParcelas = totalParcelas;
    }

    public String getCartaoBandeira() {
        return cartaoBandeira;
    }

    public void setCartaoBandeira(String cartaoBandeira) {
        this.cartaoBandeira = cartaoBandeira;
    }

    public String getCartaoFinal() {
        return cartaoFinal;
    }

    public void setCartaoFinal(String cartaoFinal) {
        this.cartaoFinal = cartaoFinal;
    }

    public String getCartaoAutorizacao() {
        return cartaoAutorizacao;
    }

    public void setCartaoAutorizacao(String cartaoAutorizacao) {
        this.cartaoAutorizacao = cartaoAutorizacao;
    }

    public String getCartaoNsu() {
        return cartaoNsu;
    }

    public void setCartaoNsu(String cartaoNsu) {
        this.cartaoNsu = cartaoNsu;
    }

    public String getChavePix() {
        return chavePix;
    }

    public void setChavePix(String chavePix) {
        this.chavePix = chavePix;
    }

    public List<ParcelaContaReceberDTO> getParcelas() {
        return parcelas;
    }

    public void setParcelas(List<ParcelaContaReceberDTO> parcelas) {
        this.parcelas = parcelas;
    }
}


