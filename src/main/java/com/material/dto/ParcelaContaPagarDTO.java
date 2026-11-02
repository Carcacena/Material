package com.material.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ParcelaContaPagarDTO {
	private Integer numeroParcela;

    private LocalDate dataVencimento;

    private BigDecimal valor;

	public Integer getNumeroParcela() {
		return numeroParcela;
	}

	public LocalDate getDataVencimento() {
		return dataVencimento;
	}

	public BigDecimal getValor() {
		return valor;
	}

	public void setNumeroParcela(Integer numeroParcela) {
		this.numeroParcela = numeroParcela;
	}

	public void setDataVencimento(LocalDate dataVencimento) {
		this.dataVencimento = dataVencimento;
	}

	public void setValor(BigDecimal valor) {
		this.valor = valor;
	}

    // getters/setters
}


