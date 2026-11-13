	package com.material.service;

	import org.springframework.beans.factory.annotation.Autowired;
	import org.springframework.stereotype.Service;
	import org.springframework.transaction.annotation.Transactional;

	import com.material.dto.CarrinhoImpostosDTO;
	import com.material.model.Carrinho;
	import com.material.model.CarrinhoImpostos;
	import com.material.model.OrigemSistema;
	import com.material.repository.CarrinhoImpostosRepository;
	import com.material.repository.CarrinhoRepository;
	import com.material.repository.OrigemSistemaRepository;

	@Service
	public class CarrinhoImpostosService {
		
	    @Autowired
	    private CarrinhoImpostosRepository impostosRepository;

	    @Autowired
	    private CarrinhoRepository carrinhoRepository;
	    
	    @Autowired
	    private OrigemSistemaRepository origemRepository; // 
	    
	    
	    
	    // 💾 Salva ou atualiza os impostos da nota — nunca duplica (1 nota = 1 registro de impostos)
	    @Transactional
	    public CarrinhoImpostos salvarOuAtualizar(Long carrinhoId, CarrinhoImpostosDTO dto) {
	        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
	                .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada: " + carrinhoId));

	        // Se já existe registro de impostos pra essa nota, reaproveita (evita duplicar)
	        CarrinhoImpostos impostos = impostosRepository.findByCarrinho_Id(carrinhoId)
	                .orElse(new CarrinhoImpostos());

	        // ⚡ REGRA DO INCREMENTO DA NOTA FISCAL (Executa apenas na geração do faturamento novo)
	        // ⚡ REGRA DO INCREMENTO DA NOTA FISCAL E ATIVAÇÃO DO STATUS
	     // ⚡ REGRA DO INCREMENTO DA NOTA FISCAL, SÉRIE E COMPROMISSO DE STATUS = 1
	        if (impostos.getId() == null) {
	            // 1. Localiza a Origem ativa instalada no Material de Construção
	            OrigemSistema origem = origemRepository.findByOrigemSistemaTrueAndUnidadeAtivaTrue()
	                    .orElseThrow(() -> new RuntimeException("Instalação ativa da Origem do Sistema (Matriz) não configurada!"));
	            
	            // 2. Aplica o Lock Pessimista para bloquear concorrência de caixas
	            origem = origemRepository.findByIdWithLock(origem.getId()).get();

	            // 3. Lê o sequencial numérico e soma +1 (Ex: 1973 -> 1974)
	            String notaAtualStr = origem.getNotafiscal();
	            int ultimaNotaNum = (notaAtualStr != null && !notaAtualStr.trim().isEmpty()) 
	                                ? Integer.parseInt(notaAtualStr.replaceAll("\\D", "")) 
	                                : 0;
	            
	            int proximaNotaNum = ultimaNotaNum + 1;
	            
	            // 4. Salva a nova numeração de volta na Origem mestre
	            origem.setNotafiscal(String.valueOf(proximaNotaNum));
	            origemRepository.save(origem);
	            
	            impostos.setNumeroNotaFiscal(proximaNotaNum);
	            impostos.setSerie(origem.getSerie() != null ? origem.getSerie() : "1");

	            // Grava a mesma identidade fiscal na tabela carrinho
	            carrinho.setNumeroNotaFiscal(proximaNotaNum);
	            carrinho.setSerie(origem.getSerie() != null ? origem.getSerie() : "1");
	            carrinhoRepository.save(carrinho);         
	        }

	        impostos.setCarrinho(carrinho);
	        impostos.setBaseCalculoIcms(dto.getBaseCalculoIcms());
	        impostos.setValorIcms(dto.getValorIcms());
	        impostos.setBaseCalculoIcmsSt(dto.getBaseCalculoIcmsSt());
	        impostos.setValorIcmsSt(dto.getValorIcmsSt());
	        impostos.setValorTotalProdutos(dto.getValorTotalProdutos());
	        impostos.setValorFrete(dto.getValorFrete());
	        impostos.setValorSeguro(dto.getValorSeguro());
	        impostos.setValorDesconto(dto.getValorDesconto());
	        impostos.setOutrasDespesasAcessorias(dto.getOutrasDespesasAcessorias());
	        impostos.setValorIpi(dto.getValorIpi());
	        impostos.setValorTotalNota(dto.getValorTotalNota());
	        
	        // Se no futuro você criar esses campos no DTO/Model, tire os comentários abaixo:
	        // impostos.setValorTotalPedido(dto.getValorTotalPedido());

	        return impostosRepository.save(impostos);
	    }

	    public CarrinhoImpostos buscarPorCarrinho(Long carrinhoId) {
	        return impostosRepository.findByCarrinho_Id(carrinhoId)
	                .orElseThrow(() -> new RuntimeException("Nenhum imposto lançado para essa nota ainda."));
	    }
	}

	
	
	
	
