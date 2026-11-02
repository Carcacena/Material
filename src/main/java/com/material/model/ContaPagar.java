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
@Table(
    name = "contas_pagar",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_contas_pagar_titulo",
            columnNames = {
                "numero_nota_fiscal",
                "serie",
                "fornecedor_id",
                "numero_parcela"
            }
        )
    }
)
public class ContaPagar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_entrada", nullable = false)
    private String numeroEntrada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "fornecedor_id",
        nullable = false
    )
    private Fornecedor fornecedor;

    @Column(name = "numero_nota_fiscal", nullable = false)
    private Integer numeroNotaFiscal;

    @Column(nullable = false, length = 10)
    private String serie;

    @Column(name = "numero_parcela", nullable = false)
    private Integer numeroParcela;

    @Column(name = "total_parcelas", nullable = false)
    private Integer totalParcelas;

    @Column(
        name = "valor_parcela",
        precision = 15,
        scale = 2,
        nullable = false
    )
    private BigDecimal valorParcela;

    @Column(
        name = "valor_pago",
        precision = 15,
        scale = 2,
        nullable = false
    )
    private BigDecimal valorPago;

    @Column(
        name = "inpc_anual_aplicado",
        precision = 5,
        scale = 2
    )
    private BigDecimal inpcAnualAplicado;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    private LocalDateTime dataPagamento;

    @Column(name = "data_lancamento", nullable = false)
    private LocalDateTime dataLancamento;

    @Column(name = "forma_pagamento", nullable = false)
    private String formaPagamento;

    @Column(nullable = false)
    private Integer status;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @Column(name = "motivo_cancelamento")
    private String motivoCancelamento;

    @PrePersist
    public void prePersist() {

        if (valorPago == null) {
            valorPago = BigDecimal.ZERO;
        }

        if (status == null) {
            status = 1;
        }

        if (dataLancamento == null) {
            dataLancamento =
                LocalDateTime.now();
        }
    }

	public Long getId() {
		return id;
	}

	public String getNumeroEntrada() {
		return numeroEntrada;
	}

	public Fornecedor getFornecedor() {
		return fornecedor;
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

	public BigDecimal getInpcAnualAplicado() {
		return inpcAnualAplicado;
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

	public LocalDateTime getDataCancelamento() {
		return dataCancelamento;
	}

	public String getMotivoCancelamento() {
		return motivoCancelamento;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setNumeroEntrada(String numeroEntrada) {
		this.numeroEntrada = numeroEntrada;
	}

	public void setFornecedor(Fornecedor fornecedor) {
		this.fornecedor = fornecedor;
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

	public void setInpcAnualAplicado(BigDecimal inpcAnualAplicado) {
		this.inpcAnualAplicado = inpcAnualAplicado;
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

	public void setDataCancelamento(LocalDateTime dataCancelamento) {
		this.dataCancelamento = dataCancelamento;
	}

	public void setMotivoCancelamento(String motivoCancelamento) {
		this.motivoCancelamento = motivoCancelamento;
	}

	

	

    // getters/setters
}
