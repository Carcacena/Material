package com.material.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContaPagarDTO {
	
	    private Long id;

	    private String numeroEntrada;

	    private Long fornecedorId;
	    private String fornecedorNome;

	    private Integer numeroNotaFiscal;
	    private String serie;

	    private Integer numeroParcela;
	    private Integer totalParcelas;

	    private BigDecimal valorParcela;
	    private BigDecimal valorPago;
	    private BigDecimal saldo;

	    private LocalDate dataVencimento;

	    private LocalDateTime dataPagamento;

	    private LocalDateTime dataLancamento;

	    private String formaPagamento;

	    private Integer status;

	    private String situacao;

		public Long getId() {
			return id;
		}

		public String getNumeroEntrada() {
			return numeroEntrada;
		}

		public Long getFornecedorId() {
			return fornecedorId;
		}

		public String getFornecedorNome() {
			return fornecedorNome;
		}

		public Integer getNumeroNotaFiscal() {
			return numeroNotaFiscal;
		}

		public String getSerie() {
			return serie;
		}

		public Integer getNumeroParcela() {
			return numeroParcela;
		}

		public Integer getTotalParcelas() {
			return totalParcelas;
		}

		public BigDecimal getValorParcela() {
			return valorParcela;
		}

		public BigDecimal getValorPago() {
			return valorPago;
		}

		public BigDecimal getSaldo() {
			return saldo;
		}

		public LocalDate getDataVencimento() {
			return dataVencimento;
		}

		public LocalDateTime getDataPagamento() {
			return dataPagamento;
		}

		public LocalDateTime getDataLancamento() {
			return dataLancamento;
		}

		public String getFormaPagamento() {
			return formaPagamento;
		}

		public Integer getStatus() {
			return status;
		}

		public String getSituacao() {
			return situacao;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public void setNumeroEntrada(String numeroEntrada) {
			this.numeroEntrada = numeroEntrada;
		}

		public void setFornecedorId(Long fornecedorId) {
			this.fornecedorId = fornecedorId;
		}

		public void setFornecedorNome(String fornecedorNome) {
			this.fornecedorNome = fornecedorNome;
		}

		public void setNumeroNotaFiscal(Integer numeroNotaFiscal) {
			this.numeroNotaFiscal = numeroNotaFiscal;
		}

		public void setSerie(String serie) {
			this.serie = serie;
		}

		public void setNumeroParcela(Integer numeroParcela) {
			this.numeroParcela = numeroParcela;
		}

		public void setTotalParcelas(Integer totalParcelas) {
			this.totalParcelas = totalParcelas;
		}

		public void setValorParcela(BigDecimal valorParcela) {
			this.valorParcela = valorParcela;
		}

		public void setValorPago(BigDecimal valorPago) {
			this.valorPago = valorPago;
		}

		public void setSaldo(BigDecimal saldo) {
			this.saldo = saldo;
		}

		public void setDataVencimento(LocalDate dataVencimento) {
			this.dataVencimento = dataVencimento;
		}

		public void setDataPagamento(LocalDateTime dataPagamento) {
			this.dataPagamento = dataPagamento;
		}

		public void setDataLancamento(LocalDateTime dataLancamento) {
			this.dataLancamento = dataLancamento;
		}

		public void setFormaPagamento(String formaPagamento) {
			this.formaPagamento = formaPagamento;
		}

		public void setStatus(Integer status) {
			this.status = status;
		}

		public void setSituacao(String situacao) {
			this.situacao = situacao;
		}
	    
	    
	    
	    
	    
	    
	    
	    
	    
	    
	    
	    

	    // getters/setters
	}