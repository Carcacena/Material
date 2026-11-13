package com.material.dto;

import java.math.BigDecimal;
import java.util.List;

public class GerarContasPagarDTO {

    private String numeroEntrada;

    private Long fornecedorId;

    private Integer numeroNotaFiscal;

    private String serie;

    private BigDecimal valorFinalCorrigido;

    private BigDecimal inpcAnualAplicado;

    private String formaPagamento;

    private List<ParcelaContaPagarDTO> parcelas;

	public String getNumeroEntrada() {
		return numeroEntrada;
	}

	public Long getFornecedorId() {
		return fornecedorId;
	}

	public Integer getNumeroNotaFiscal() {
		return numeroNotaFiscal;
	}

	public String getSerie() {
		return serie;
	}

	public BigDecimal getValorFinalCorrigido() {
		return valorFinalCorrigido;
	}

	public BigDecimal getInpcAnualAplicado() {
		return inpcAnualAplicado;
	}

	public String getFormaPagamento() {
		return formaPagamento;
	}

	public List<ParcelaContaPagarDTO> getParcelas() {
		return parcelas;
	}

	public void setNumeroEntrada(String numeroEntrada) {
		this.numeroEntrada = numeroEntrada;
	}

	public void setFornecedorId(Long fornecedorId) {
		this.fornecedorId = fornecedorId;
	}

	public void setNumeroNotaFiscal(Integer numeroNotaFiscal) {
		this.numeroNotaFiscal = numeroNotaFiscal;
	}

	public void setSerie(String serie) {
		this.serie = serie;
	}

	public void setValorFinalCorrigido(BigDecimal valorFinalCorrigido) {
		this.valorFinalCorrigido = valorFinalCorrigido;
	}

	public void setInpcAnualAplicado(BigDecimal inpcAnualAplicado) {
		this.inpcAnualAplicado = inpcAnualAplicado;
	}

	public void setFormaPagamento(String formaPagamento) {
		this.formaPagamento = formaPagamento;
	}

	public void setParcelas(List<ParcelaContaPagarDTO> parcelas) {
		this.parcelas = parcelas;
	}

	
	
        
    
    
    
    
    
    
    
    
    
}

