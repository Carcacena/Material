package com.material.model;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "carrinho_movimento")
public class CarrinhoMovimento {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "carrinho_id", nullable = false)
	    private Carrinho  carrinho;

	    @Column(nullable = false)
	    private Integer status;

	    @Column(name = "tipo_movimento", nullable = false, length = 20)
	    private String tipoMovimento;

	    @Column(name = "data_movimento", nullable = false)
	    private LocalDateTime dataMovimento;

	    public CarrinhoMovimento() {
	    }

	    public Long getId() {
	        return id;
	    }

	    public void setId(Long id) {
	        this.id = id;
	    }

		public Carrinho getCarrinho() {
			return carrinho;
		}

		public Integer getStatus() {
			return status;
		}

		public String getTipoMovimento() {
			return tipoMovimento;
		}

		public LocalDateTime getDataMovimento() {
			return dataMovimento;
		}

		public void setCarrinho(Carrinho carrinho) {
			this.carrinho = carrinho;
		}

		public void setStatus(Integer status) {
			this.status = status;
		}

		public void setTipoMovimento(String tipoMovimento) {
			this.tipoMovimento = tipoMovimento;
		}

		public void setDataMovimento(LocalDateTime dataMovimento) {
			this.dataMovimento = dataMovimento;
		}

}
