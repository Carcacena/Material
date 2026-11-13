package com.material.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "contas_receber", uniqueConstraints = {
		@UniqueConstraint(name = "uk_contas_receber_titulo", columnNames = { "numero_nota_fiscal", "serie",
				"cliente_id", "numero_parcela" }) })
public class ContaReceber {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "numero_pedido", nullable = false, length = 20)
	private String numeroPedido;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "cliente_id", nullable = false)
	private Cliente cliente;

	@Column(name = "numero_nota_fiscal", nullable = false)
	private Integer numeroNotaFiscal;

	@Column(nullable = false, length = 10)
	private String serie;

	@Column(name = "numero_parcela", nullable = false)
	private Integer numeroParcela = 1;

	@Column(name = "total_parcelas", nullable = false)
	private Integer totalParcelas = 1;

	@Column(name = "valor_parcela", nullable = false, precision = 15, scale = 2)
	private BigDecimal valorParcela;

	@Column(name = "valor_pago", nullable = false, precision = 15, scale = 2)
	private BigDecimal valorPago = BigDecimal.ZERO;

	@Column(name = "inpc_anual_aplicado", precision = 5, scale = 2)
	private BigDecimal inpcAnualAplicado = BigDecimal.ZERO;

	@Column(name = "data_vencimento", nullable = false)
	private LocalDate dataVencimento;

	@Column(name = "data_pagamento")
	private LocalDateTime dataPagamento;

	@Column(name = "data_lancamento", nullable = false)
	private LocalDateTime dataLancamento;

	@Column(name = "forma_pagamento", nullable = false, length = 30)
	private String formaPagamento;

	@Column(name = "cartao_bandeira", length = 20)
	private String cartaoBandeira;

	@Column(name = "cartao_final", length = 4)
	private String cartaoFinal;

	@Column(name = "cartao_autorizacao", length = 50)
	private String cartaoAutorizacao;

	@Column(name = "cartao_nsu", length = 50)
	private String cartaoNsu;

	@Column(name = "chave_pix", length = 100)
	private String chavePix;

	@Column(nullable = false)
	private Integer status = 1;

	@Column(name = "data_devolucao")
	private LocalDateTime dataDevolucao;

	@Column(name = "motivo_devolucao", length = 255)
	private String motivoDevolucao;

	@PrePersist
	public void prePersist() {

		if (dataLancamento == null) {
			dataLancamento = LocalDateTime.now();
		}

		if (valorPago == null) {
			valorPago = BigDecimal.ZERO;
		}

		if (inpcAnualAplicado == null) {
			inpcAnualAplicado = BigDecimal.ZERO;
		}

		if (status == null) {
			status = 1;
		}
	}

	// GETTERS E SETTERS

	public Long getId() {
		return id;
	}

	public String getNumeroPedido() {
		return numeroPedido;
	}

	public void setNumeroPedido(String numeroPedido) {
		this.numeroPedido = numeroPedido;
	}

	public Cliente getCliente() {
		return cliente;
	}

	public void setCliente(Cliente cliente) {
		this.cliente = cliente;
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

	public Integer getNumeroParcela() {
		return numeroParcela;
	}

	public void setNumeroParcela(Integer numeroParcela) {
		this.numeroParcela = numeroParcela;
	}

	public Integer getTotalParcelas() {
		return totalParcelas;
	}

	public void setTotalParcelas(Integer totalParcelas) {
		this.totalParcelas = totalParcelas;
	}

	public BigDecimal getValorParcela() {
		return valorParcela;
	}

	public void setValorParcela(BigDecimal valorParcela) {
		this.valorParcela = valorParcela;
	}

	public BigDecimal getValorPago() {
		return valorPago;
	}

	public void setValorPago(BigDecimal valorPago) {
		this.valorPago = valorPago;
	}

	public BigDecimal getInpcAnualAplicado() {
		return inpcAnualAplicado;
	}

	public void setInpcAnualAplicado(BigDecimal inpcAnualAplicado) {
		this.inpcAnualAplicado = inpcAnualAplicado;
	}

	public LocalDate getDataVencimento() {
		return dataVencimento;
	}

	public void setDataVencimento(LocalDate dataVencimento) {
		this.dataVencimento = dataVencimento;
	}

	public LocalDateTime getDataPagamento() {
		return dataPagamento;
	}

	public void setDataPagamento(LocalDateTime dataPagamento) {
		this.dataPagamento = dataPagamento;
	}

	public LocalDateTime getDataLancamento() {
		return dataLancamento;
	}

	public void setDataLancamento(LocalDateTime dataLancamento) {
		this.dataLancamento = dataLancamento;
	}

	public String getFormaPagamento() {
		return formaPagamento;
	}

	public void setFormaPagamento(String formaPagamento) {
		this.formaPagamento = formaPagamento;
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

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public LocalDateTime getDataDevolucao() {
		return dataDevolucao;
	}

	public void setDataDevolucao(LocalDateTime dataDevolucao) {
		this.dataDevolucao = dataDevolucao;
	}

	public String getMotivoDevolucao() {
		return motivoDevolucao;
	}

	public void setMotivoDevolucao(String motivoDevolucao) {
		this.motivoDevolucao = motivoDevolucao;
	}
}
