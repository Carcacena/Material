package com.material.service;

import java.time.LocalDateTime;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.material.dto.CarrinhoMovimentoDTO;
import com.material.model.Carrinho;
import com.material.model.CarrinhoMovimento;
import com.material.repository.CarrinhoMovimentoRepository;

@Service
public class CarrinhoMovimentoService {
	
	 @Autowired
	    private CarrinhoMovimentoRepository carrinhoMovimentoRepository;
	// =========================================================================
	    // 💸 GRAVA MOVIMENTO DE VENDA / FATURAMENTO (Gatilho do Contas a Receber)
	    // =========================================================================
	    @Transactional
	    public void registrarCarrinho(Carrinho carrinho) {
	        // 🌟 MUDANÇA CONCEITUAL: Carimba como FATURAMENTO para diferenciar das compras!
	        registrarMovimento(
	            carrinho,
	            1,
	            "FATURAMENTO"
	        );
	    }

	    @Transactional
	    public void registrarDevolucao(Carrinho carrinho) {
	        registrarMovimento(
	            carrinho,
	            2,
	            "DEVOLUCAO"
	        );
	    }

	    // ==========================================
	    // MÉTODO INTERNO
	    // ==========================================
	    private void registrarMovimento(
	            Carrinho carrinho,
	            Integer status,
	            String tipoMovimento) {

	    	boolean jaExiste =
	    		    carrinhoMovimentoRepository
	    		        .existsByCarrinho_IdAndTipoMovimento(
	    		            carrinho.getId(),
	    		            tipoMovimento
	    		        );

	    		if (jaExiste) {
	    		    return;
	    		}
	    
	        CarrinhoMovimento movimento =
	                new CarrinhoMovimento();

	        movimento.setCarrinho(carrinho);
	        movimento.setStatus(status);
	        movimento.setTipoMovimento(tipoMovimento);
	        movimento.setDataMovimento(LocalDateTime.now());
	        System.out.println(">>> MOVIMENTO CHAMADO: carrinho=" + carrinho.getId()
	        + " tipo=" + tipoMovimento
	        + " status=" + status);
	        carrinhoMovimentoRepository.save(movimento);
	    }

	    

	    // ==========================================
	    // LISTA PELO NÚMERO DA NOTA
	    // ==========================================
	 // =========================================================================
	    // 📄 LISTA HISTÓRICO PELO NÚMERO DA NOTA FISCAL (ÍNDICE FISCAL SOBERANO)
	    // =========================================================================
	    @Transactional(readOnly = true)
	    public List<CarrinhoMovimentoDTO> listarPorNotaFiscal(Integer numeroNotaFiscal) {

	        return carrinhoMovimentoRepository
	                .findByCarrinho_NumeroNotaFiscalOrderByDataMovimentoAsc(numeroNotaFiscal)
	                .stream()
	                .map(this::converterDTO)
	                .toList();
	    }

	    // ==========================================
	    // ENTITY -> DTO
	    // ==========================================
	    private CarrinhoMovimentoDTO converterDTO(
	            CarrinhoMovimento movimento) {

	        return new CarrinhoMovimentoDTO(
	            movimento.getId(),
	            movimento.getCarrinho().getId(),
	            movimento.getCarrinho().getNumeroPedido(),
	            movimento.getStatus(),
	            movimento.getTipoMovimento(),
	            movimento.getDataMovimento()
	        );
	    }

	    @Transactional(readOnly = true)
	    public List<CarrinhoMovimentoDTO> listarPorCarrinho(Long carrinhoId) {

	        return carrinhoMovimentoRepository
	                .findByCarrinho_IdOrderByDataMovimentoAsc(carrinhoId)
	                .stream()
	                .map(this::converterDTO)
	                .toList();
	    }

}
	
	
	


