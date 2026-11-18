package com.material.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProdutoDTO {
	private String nome;
	private String codigoBarras;
	private Boolean aGranel;
	private BigDecimal precoCusto;
	private BigDecimal precoVenda;
	private LocalDate dataValidade;
	private int qteEntrada;
	private int estoqueAtual;
	private String registroMs;
	private String principioAtivo;
	private String tipoTarja; // MIP, VERMELHA, RETENCAO, PRETA
	private String lote;
	private BigDecimal pmc;
	private String documentoApv;

	// 🔗 Vincular os mapeamentos de subobjetos vindos do Front-end
	private FornecedorIdDTO fornecedor;
	private CategoriaIdDTO categoria;

	// Subclasses auxiliares para capturar a estrutura { id: X }
	public static class FornecedorIdDTO {
		private Long id;

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}
	}

	public static class CategoriaIdDTO {
		private Long id;

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}
	}

	// ==========================================
	// GETTERS E SETTERS
	// ==========================================
	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCodigoBarras() {
		return codigoBarras;
	}

	public void setCodigoBarras(String codigoBarras) {
		this.codigoBarras = codigoBarras;
	}

	public Boolean getAGranel() {
		return aGranel;
	}

	public void setAGranel(Boolean aGranel) {
		this.aGranel = aGranel;
	}

	public BigDecimal getPrecoCusto() {
		return precoCusto;
	}

	public void setPrecoCusto(BigDecimal precoCusto) {
		this.precoCusto = precoCusto;
	}

	public BigDecimal getPrecoVenda() {
		return precoVenda;
	}

	public void setPrecoVenda(BigDecimal precoVenda) {
		this.precoVenda = precoVenda;
	}

	public LocalDate getDataValidade() {
		return dataValidade;
	}

	public void setDataValidade(LocalDate dataValidade) {
		this.dataValidade = dataValidade;
	}

	public int getQteEntrada() {
		return qteEntrada;
	}

	public void setQteEntrada(int qteEntrada) {
		this.qteEntrada = qteEntrada;
	}

	public int getEstoqueAtual() {
		return estoqueAtual;
	}

	public void setEstoqueAtual(int estoqueAtual) {
		this.estoqueAtual = estoqueAtual;
	}

	public FornecedorIdDTO getFornecedor() {
		return fornecedor;
	}

	public void setFornecedor(FornecedorIdDTO fornecedor) {
		this.fornecedor = fornecedor;
	}

	public CategoriaIdDTO getCategoria() {
		return categoria;
	}

	public void setCategoria(CategoriaIdDTO categoria) {
		this.categoria = categoria;
	}

	public String getRegistroMs() {
		return registroMs;
	}

	public String getPrincipioAtivo() {
		return principioAtivo;
	}

	public String getTipoTarja() {
		return tipoTarja;
	}

	public String getLote() {
		return lote;
	}

	public BigDecimal getPmc() {
		return pmc;
	}

	public void setRegistroMs(String registroMs) {
		this.registroMs = registroMs;
	}

	public void setPrincipioAtivo(String principioAtivo) {
		this.principioAtivo = principioAtivo;
	}

	public void setTipoTarja(String tipoTarja) {
		this.tipoTarja = tipoTarja;
	}

	public void setLote(String lote) {
		this.lote = lote;
	}

	public void setPmc(BigDecimal pmc) {
		this.pmc = pmc;
	}

	public String getDocumentoApv() {
		return documentoApv;
	}

	public void setDocumentoApv(String documentoApv) {
		this.documentoApv = documentoApv;
	}

}