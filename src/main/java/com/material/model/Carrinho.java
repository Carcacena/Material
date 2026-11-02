package com.material.model; 

import jakarta.persistence.*; 
import java.math.BigDecimal; 
import java.time.LocalDateTime; 

@Entity 
@Table(name = "carrinho") 
public class Carrinho { 

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    
    @Column(name = "numero_nota_fiscal")
    private Integer numeroNotaFiscal;

    // 🌟 INCLUSÃO: Série Fiscal casada com o cadastro mestre da Origem
    @Column(name = "serie", length = 10, nullable = false)
    private String serie = "1";

    
    // 🔥 NOVO CAMPO: Mapeamento do isolador de cupons do balcão
    @Column(name = "numero_pedido", nullable = false, length = 20)
    private String numeroPedido;

    // Relacionamento Pai e Filho com a tabela de Clientes 
    @ManyToOne 
    @JoinColumn(name = "cliente_id", nullable = false) 
    private Cliente cliente; 

    // Relacionamento Pai e Filho com a tabela de Produtos 
    @ManyToOne 
    @JoinColumn(name = "produto_id", nullable = false) 
    private Produto produto; 

    @Column(nullable = false, precision = 10, scale = 3) 
    private BigDecimal quantidade; 

    @Column(name = "preco_praticado", nullable = false, precision = 10, scale = 2) 
    private BigDecimal precoPraticado; 

    @Column(nullable = false) 
    private Integer status = 1; // 1 = Em Andamento, 2 = Faturado, 3 = Pendente

    @Column(name = "data_criacao") 
    private LocalDateTime dataCriacao = LocalDateTime.now(); 

    // --- GETTERS E SETTERS (Sincronizados para o Hibernate) --- 

    // 🔥 GETTER E SETTER DO NOVO CAMPO
    public String getNumeroPedido() {
        return numeroPedido;
    }

    public void setNumeroPedido(String numeroPedido) {
        this.numeroPedido = numeroPedido;
    }

    public Long getId() { 
        return id; 
    } 

    public void setId(Long id) { 
        final Long localId = id;
        this.id = localId; 
   } 
    
    

    public Integer getNumeroNotaFiscal() {
		return numeroNotaFiscal;
	}

	public String getSerie() {
		return serie;
	}

	public void setNumeroNotaFiscal(Integer numeroNotaFiscal) {
		this.numeroNotaFiscal = numeroNotaFiscal;
	}

	public void setSerie(String serie) {
		this.serie = serie;
	}

	public Cliente getCliente() { 
        return cliente; 
    } 

    public void setCliente(Cliente cliente) { 
        final Cliente localCliente = cliente;
        this.cliente = localCliente; 
    } 

    public Produto getProduto() { 
        return produto; 
    } 

    public void setProduto(Produto produto) { 
        final Produto localProduto = produto;
        this.produto = localProduto; 
    } 

    public BigDecimal getQuantidade() { 
        return quantidade; 
    } 

    public void setQuantidade(BigDecimal quantidade) { 
        final BigDecimal localQuantidade = quantidade;
        this.quantidade = localQuantidade; 
    } 

    public BigDecimal getPrecoPraticado() { 
        return precoPraticado; 
    } 

    public void setPrecoPraticado(BigDecimal precoPraticado) { 
        final BigDecimal localPrecoPraticado = precoPraticado;
        this.precoPraticado = localPrecoPraticado; 
    } 

    public Integer getStatus() { 
        return status; 
    } 

    public void setStatus(Integer status) { 
        final Integer localStatus = status;
        this.status = localStatus; 
    } 

    public LocalDateTime getDataCriacao() { 
        return dataCriacao; 
    } 

    public void setDataCriacao(LocalDateTime dataCriacao) { 
        final LocalDateTime localDataCriacao = dataCriacao;
        this.dataCriacao = localDataCriacao; 
    } 
}