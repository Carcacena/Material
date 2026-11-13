package com.material.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entrada")
public class Entrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

  
    @Column(name = "numero_nota", length = 20)
    private String numeroNota; // No Java usamos camelCase!
    @Column(name = "status")
    
    private Integer status = 1; // 1 = Ativa, 2 = Devolvida 
    @Column(length = 5)
    private String serie;

    @Column(name = "chave_acesso", nullable = false, length = 44)
    private String chaveAcesso;

    @Column(name = "data_recebimento", nullable = false)
    private LocalDate dataRecebimento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @OneToMany(mappedBy = "entrada", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntradaProdutos> itens = new ArrayList<>();

    // 🌟 ADICIONADO: O elo que faltava para gravar os impostos em cascata automática
    @OneToOne(mappedBy = "entrada", cascade = CascadeType.ALL, orphanRemoval = true)
    private EntradaImpostos impostos;

    // ======================
    // MÉTODOS AUXILIARES DE COORDENAÇÃO (BI-DIRECIONAL)
    // ======================
    
    public void setItens(List<EntradaProdutos> novosItens) {
        this.itens.clear(); 
        if (novosItens != null) {
            for (EntradaProdutos item : novosItens) {
                item.setEntrada(this); 
            }
            this.itens.addAll(novosItens); 
        }
    }

    // 🌟 ADICIONADO: Método utilitário para amarrar os dois lados do relacionamento 1:1
    public void setImpostos(EntradaImpostos novosImpostos) {
        this.impostos = novosImpostos;
        if (novosImpostos != null) {
            novosImpostos.setEntrada(this); // Injeta o ID do cabeçalho na FK do filho
        }
    }
    
    public java.math.BigDecimal getValorTotal() {
        // Se a nota tiver impostos gravados, pega o valor total que está lá
        if (this.impostos != null && this.impostos.getValorTotalNota() != null) {
            return this.impostos.getValorTotalNota();
        }
        
        // Caso não tenha a tabela de impostos preenchida ainda, calcula somando os itens
        if (this.itens != null && !this.itens.isEmpty()) {
            return this.itens.stream()
                .map(item -> item.getTotal() != null ? item.getTotal() : java.math.BigDecimal.ZERO)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        }
        
        return java.math.BigDecimal.ZERO;
    }
    
    
    
    // ======================
    // GETTERS E SETTERS
    // ======================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroNota() { return numeroNota; }
    public void setNumeroNota(String numeroNota) { this.numeroNota = numeroNota; }
    public String getSerie() { return serie; }
    public void setSerie(String serie) { this.serie = serie; }
    public String getChaveAcesso() { return chaveAcesso; }
    public void setChaveAcesso(String chaveAcesso) { this.chaveAcesso = chaveAcesso; }
    public LocalDate getDataRecebimento() { return dataRecebimento; }
    public void setDataRecebimento(LocalDate dataRecebimento) { this.dataRecebimento = dataRecebimento; }
    public Fornecedor getFornecedor() { return fornecedor; }
    public void setFornecedor(Fornecedor fornecedor) { this.fornecedor = fornecedor; }
    public List<EntradaProdutos> getItens() { return itens; }
    public EntradaImpostos getImpostos() { return impostos; } // Adicionado getter

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}
    
    
    
    
    
}