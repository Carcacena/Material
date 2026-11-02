package com.material.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "entrada_produtos")
public class EntradaProdutos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "entrada_id", nullable = false)
    private Entrada entrada;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto; // Relaciona com a sua entidade Produto existente

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_custo", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoCusto;
    
 // ✨ ADICIONADO: Calcula o total do item multiplicando quantidade pelo preço de custo
    public BigDecimal getTotal() {
        if (this.quantidade != null && this.precoCusto != null) {
            return this.precoCusto.multiply(BigDecimal.valueOf(this.quantidade));
        }
        return BigDecimal.ZERO;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Entrada getEntrada() { return entrada; }
    public void setEntrada(Entrada entrada) { this.entrada = entrada; }
    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public BigDecimal getPrecoCusto() { return precoCusto; }
    public void setPrecoCusto(BigDecimal precoCusto) { this.precoCusto = precoCusto; }
}