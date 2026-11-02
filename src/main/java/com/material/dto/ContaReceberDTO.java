package com.material.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ContaReceberDTO {

	 private Long id;

	    private String numeroPedido;

	    private Long clienteId;
	    private String clienteNome;

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
	    
	    
	 // getters/setters
	    

		public Long getId() {
			return id;
		}

		public String getNumeroPedido() {
			return numeroPedido;
		}

		public Long getClienteId() {
			return clienteId;
		}

		public String getClienteNome() {
			return clienteNome;
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

		public void setNumeroPedido(String numeroPedido) {
			this.numeroPedido = numeroPedido;
		}

		public void setClienteId(Long clienteId) {
			this.clienteId = clienteId;
		}

		public void setClienteNome(String clienteNome) {
			this.clienteNome = clienteNome;
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

		public void setFormaPagamento(String formaPagamento) {
			this.formaPagamento = formaPagamento;
		}

		public void setStatus(Integer status) {
			this.status = status;
		}

		public void setSituacao(String situacao) {
			this.situacao = situacao;
		}

	    
		

		public LocalDateTime getDataLancamento() {
		    return dataLancamento;
		}

		public void setDataLancamento(
		        LocalDateTime dataLancamento) {
		    this.dataLancamento = dataLancamento;
		}
	    
	    
	    
	    
	    
	    
	    
	}