package com.material.dto;

import java.time.LocalDateTime;

public class CarrinhoMovimentoDTO {
	
	
	  private Long id;
	    private Long carrinhoId;
	    private String numeroNota;
	    private Integer status;
	    private String tipoMovimento;
	    private LocalDateTime dataMovimento;

	    public CarrinhoMovimentoDTO() {
	    }

	    public CarrinhoMovimentoDTO(
	            Long id,
	            Long carrinhoId,
	            String numeroNota,
	            Integer status,
	            String tipoMovimento,
	            LocalDateTime dataMovimento) {

	        this.id = id;
	        this.carrinhoId = carrinhoId;
	        this.numeroNota = numeroNota;
	        this.status = status;
	        this.tipoMovimento = tipoMovimento;
	        this.dataMovimento = dataMovimento;
	    }

		public Long getId() {
			return id;
		}

		public Long getCarrihoId() {
			return getCarrihoId();
		}

		public String getNumeroNota() {
			return numeroNota;
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

		public void setId(Long id) {
			this.id = id;
		}

		public void setCarrihoId(Long carrihoId) {
			this.carrinhoId = carrihoId;
		}

		public void setNumeroNota(String numeroNota) {
			this.numeroNota = numeroNota;
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
