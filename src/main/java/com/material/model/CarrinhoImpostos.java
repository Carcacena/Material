package com.material.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "carrinho_impostos")

public class CarrinhoImpostos {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @OneToOne
	    @JoinColumn(name = "carrinho_id", nullable = false, unique = true)
	    @JsonIgnore
	    private Carrinho carrinho;
	    
	 

	    @Column(name = "base_calculo_icms", precision = 12, scale = 2)
	    private BigDecimal baseCalculoIcms;

	    @Column(name = "valor_icms", precision = 12, scale = 2)
	    private BigDecimal valorIcms;

	    @Column(name = "base_calculo_icms_st", precision = 12, scale = 2)
	    private BigDecimal baseCalculoIcmsSt;

	    @Column(name = "valor_icms_st", precision = 12, scale = 2)
	    private BigDecimal valorIcmsSt;

	    @Column(name = "valor_total_produtos", precision = 12, scale = 2)
	    private BigDecimal valorTotalProdutos;

	    @Column(name = "valor_frete", precision = 12, scale = 2)
	    private BigDecimal valorFrete;

	    @Column(name = "valor_seguro", precision = 12, scale = 2)
	    private BigDecimal valorSeguro;

	    @Column(name = "valor_desconto", precision = 12, scale = 2)
	    private BigDecimal valorDesconto;

	    @Column(name = "outras_despesas_acessorias", precision = 12, scale = 2)
	    private BigDecimal outrasDespesasAcessorias;

	    @Column(name = "valor_ipi", precision = 12, scale = 2)
	    private BigDecimal valorIpi;

	    @Column(name = "valor_total_nota", precision = 12, scale = 2)
	    private BigDecimal valorTotalNota;

		public Long getId() {
			return id;
		}

		public Carrinho getCarrinho() {
			return carrinho;
		}

		
		
		
		public BigDecimal getBaseCalculoIcms() {
			return baseCalculoIcms;
		}

		public BigDecimal getValorIcms() {
			return valorIcms;
		}

		public BigDecimal getBaseCalculoIcmsSt() {
			return baseCalculoIcmsSt;
		}

		public BigDecimal getValorIcmsSt() {
			return valorIcmsSt;
		}

		public BigDecimal getValorTotalProdutos() {
			return valorTotalProdutos;
		}

		public BigDecimal getValorFrete() {
			return valorFrete;
		}

		public BigDecimal getValorSeguro() {
			return valorSeguro;
		}

		public BigDecimal getValorDesconto() {
			return valorDesconto;
		}

		public BigDecimal getOutrasDespesasAcessorias() {
			return outrasDespesasAcessorias;
		}

		public BigDecimal getValorIpi() {
			return valorIpi;
		}

		public BigDecimal getValorTotalNota() {
			return valorTotalNota;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public void setCarrinho(Carrinho carrinho) {
			this.carrinho = carrinho;
		}

		public void setBaseCalculoIcms(BigDecimal baseCalculoIcms) {
			this.baseCalculoIcms = baseCalculoIcms;
		}

		public void setValorIcms(BigDecimal valorIcms) {
			this.valorIcms = valorIcms;
		}

		public void setBaseCalculoIcmsSt(BigDecimal baseCalculoIcmsSt) {
			this.baseCalculoIcmsSt = baseCalculoIcmsSt;
		}

		public void setValorIcmsSt(BigDecimal valorIcmsSt) {
			this.valorIcmsSt = valorIcmsSt;
		}

		public void setValorTotalProdutos(BigDecimal valorTotalProdutos) {
			this.valorTotalProdutos = valorTotalProdutos;
		}

		public void setValorFrete(BigDecimal valorFrete) {
			this.valorFrete = valorFrete;
		}

		public void setValorSeguro(BigDecimal valorSeguro) {
			this.valorSeguro = valorSeguro;
		}

		public void setValorDesconto(BigDecimal valorDesconto) {
			this.valorDesconto = valorDesconto;
		}

		public void setOutrasDespesasAcessorias(BigDecimal outrasDespesasAcessorias) {
			this.outrasDespesasAcessorias = outrasDespesasAcessorias;
		}

		public void setValorIpi(BigDecimal valorIpi) {
			this.valorIpi = valorIpi;
		}

		public void setValorTotalNota(BigDecimal valorTotalNota) {
			this.valorTotalNota = valorTotalNota;
		}

		public void setNumeroNotaFiscal(int proximaNotaNum) {
			// TODO Auto-generated method stub
			
		}

		public Object getNumeroNotaFiscal() {
			// TODO Auto-generated method stub
			return null;
		}

		public Object getSerie() {
			// TODO Auto-generated method stub
			return null;
		}

		public void setSerie(Object object) {
			// TODO Auto-generated method stub
			
		}
	    
	    
	    
	    
	    
	    
	    
	    
}
	    
	    
	    
	    
	    

	    