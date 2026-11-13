package com.material.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.material.dto.CarrinhoMovimentoDTO;
import com.material.model.Carrinho;
import com.material.model.CarrinhoMovimento;

	@Repository
	public interface CarrinhoMovimentoRepository extends JpaRepository<CarrinhoMovimento, Long> {
	    	
		List<CarrinhoMovimento> findByCarrinho_NumeroNotaFiscalOrderByDataMovimentoAsc(Integer numeroNotaFiscal);

		List<CarrinhoMovimento> findByCarrinho_IdOrderByDataMovimentoAsc(Long carrinhoId);

		boolean existsByCarrinho_IdAndTipoMovimento(
		        Long carrinhoId,
		        String tipoMovimento
		);
		
}