package com.material.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "produto_farmacia")
public class ProdutoFarmacia {

    @Id
    @Column(name = "produto_id")
    private Long produtoId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "produto_id")
    @JsonIgnore
    private Produto produto;

    @Column(name = "registro_ms", nullable = false, length = 20)
    private String registroMs;

    @Column(name = "principio_ativo", nullable = false, length = 150)
    private String principioAtivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_tarja", nullable = false)
    private TipoTarja tipoTarja;

    @Column(name = "lote", nullable = false, length = 50)
    private String lote;

    @Column(name = "pmc", precision = 10, scale = 2)
    private BigDecimal pmc;

    public enum TipoTarja {
        MIP,
        VERMELHA,
        RETENCAO,
        PRETA
    }

    // Getters e Setters
    public Long getProdutoId() { return produtoId; }
    public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }

    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }

    public String getRegistroMs() { return registroMs; }
    public void setRegistroMs(String registroMs) { this.registroMs = registroMs; }

    public String getPrincipioAtivo() { return principioAtivo; }
    public void setPrincipioAtivo(String principioAtivo) { this.principioAtivo = principioAtivo; }

    public TipoTarja getTipoTarja() { return tipoTarja; }
    public void setTipoTarja(TipoTarja tipoTarja) { this.tipoTarja = tipoTarja; }

    public String getLote() { return lote; }
    public void setLote(String lote) { this.lote = lote; }

    public BigDecimal getPmc() { return pmc; }
    public void setPmc(BigDecimal pmc) { this.pmc = pmc; }
}