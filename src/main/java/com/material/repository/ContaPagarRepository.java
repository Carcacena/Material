package com.material.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.material.model.ContaPagar;


public interface ContaPagarRepository 
	extends JpaRepository<ContaPagar, Long> {

	List<ContaPagar> findAllByOrderByDataVencimentoAsc();

	List<ContaPagar> findByFornecedorIdOrderByDataVencimentoAsc(Long fornecedorId);

	List<ContaPagar> findByNumeroNotaFiscalAndSerieOrderByNumeroParcelaAsc(Integer numeroNotaFiscal, String serie);

	List<ContaPagar> findByNumeroEntrada(String numeroEntrada);
}
