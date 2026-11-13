package com.material.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.material.model.ContaReceber;

public interface ContaReceberRepository extends JpaRepository<ContaReceber, Long> {

	List<ContaReceber> findAllByOrderByDataVencimentoAsc();

	List<ContaReceber> findByClienteIdOrderByDataVencimentoAsc(Long clienteId);

	List<ContaReceber> findByNumeroNotaFiscalAndSerieOrderByNumeroParcelaAsc(Integer numeroNotaFiscal, String serie);

	List<ContaReceber> findByNumeroNotaFiscalAndSerieAndClienteIdOrderByNumeroParcelaAsc(Integer numeroNotaFiscal,
			String serie, Long clienteId);

	List<ContaReceber> findByStatusOrderByDataVencimentoAsc(Integer status);

	List<ContaReceber> findByDataVencimentoBeforeAndStatus(LocalDate data, Integer status);

	List<ContaReceber> findByNumeroPedido(String numeroPedido);

	Optional<ContaReceber> findByNumeroNotaFiscalAndSerieAndClienteIdAndNumeroParcela(Integer numeroNotaFiscal,
			String serie, Long clienteId, Integer numeroParcela);
}