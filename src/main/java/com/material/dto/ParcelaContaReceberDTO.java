package com.material.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ParcelaContaReceberDTO {
	
	private Integer numeroParcela;
    private LocalDate dataVencimento;
    private BigDecimal valor;

    public Integer getNumeroParcela() {
        return numeroParcela;
    }

    public void setNumeroParcela(Integer numeroParcela) {
        this.numeroParcela = numeroParcela;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}
	


