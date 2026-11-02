package com.material.service;

import com.material.dto.EntradaRequestDTO;
import com.material.dto.ItemEntradaDTO;
import com.material.model.Entrada;
import com.material.model.EntradaProdutos;
import com.material.model.Fornecedor;
import com.material.model.Produto;
import com.material.repository.EntradaRepository;
import com.material.repository.FornecedorRepository;
import com.material.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EntradaService {
	
	 @Autowired
	    private EntradaRepository entradaRepository;

	    @Autowired
	    private FornecedorRepository fornecedorRepository;

	    @Autowired
	    private ProdutoRepository produtoRepository;

	    @Autowired
	    private EntradaMovimentoService entradaMovimentoService;
 
    @Transactional
    public Entrada registrarEntrada(EntradaRequestDTO dto) {
        // 1. Localiza o Fornecedor da Nota
        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com o ID: " + dto.getFornecedorId()));

        // 2. Instancia e salva o Cabeçalho PRIMEIRO para gerar o ID no banco
        Entrada entrada = new Entrada();
        entrada.setNumeroNota(dto.getNumeroNota());
        entrada.setSerie(dto.getSerie());
        entrada.setChaveAcesso(dto.getChaveAcesso());
        entrada.setDataRecebimento(dto.getDataRecebimento());
        entrada.setFornecedor(fornecedor);
        
        // 🌟 CORREÇÃO CRÍTICA: Salva o cabeçalho imediatamente para ter o ID disponível
        entrada = entradaRepository.saveAndFlush(entrada);

        List<EntradaProdutos> itensDaEntrada = new ArrayList<>();

        // 3. Processa cada item vindo do Postman/Tela
        for (ItemEntradaDTO itemDTO : dto.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado com o ID: " + itemDTO.getProdutoId()));

            // Instancia o relacionamento do item com a nota
            EntradaProdutos itemEntrada = new EntradaProdutos();
            itemEntrada.setEntrada(entrada); // 🌟 Aqui o ID da nota já existe e não é nulo!
            itemEntrada.setProduto(produto);
            itemEntrada.setQuantidade(itemDTO.getQuantidade());
            itemEntrada.setPrecoCusto(itemDTO.getPrecoCusto());
            itensDaEntrada.add(itemEntrada);

            // 4. ATUALIZAÇÃO DO ESTOQUE DO PRODUTO
            produto.setPrecoCusto(itemDTO.getPrecoCusto()); // Atualiza o custo com o valor da nota

            // No seu banco, aGranel usa '0' ou '1'. No Java tratamos como Boolean.
            if (Boolean.TRUE.equals(produto.getAGranel())) {
                BigDecimal qtdAdicionar = BigDecimal.valueOf(itemDTO.getQuantidade());
                produto.setEstoque(produto.getEstoque().add(qtdAdicionar));
            } else {
                produto.setQteEntrada(itemDTO.getQuantidade());
                produto.setEstoqueAtual(produto.getEstoqueAtual() + itemDTO.getQuantidade());
            }

            // Salva a atualização de estoque no produto
            produtoRepository.save(produto);
        }

        // Associa a lista de itens criados à entrada
        //entrada.setItens(itensDaEntrada);

        // Salva novamente para consolidar os itens (CascadeType.ALL cuidará de gravar na tabela entrada_produtos)
        //return entradaRepository.save(entrada);
        
        entrada.setItens(itensDaEntrada);

        Entrada entradaSalva = entradaRepository.save(entrada);

        // 📚 Guarda no histórico: STATUS 1 = ENTRADA
        entradaMovimentoService.registrarEntrada(entradaSalva);

        return entradaSalva;
        
        
         
    }
    
    @Transactional
    public Entrada devolverNota(String numeroNota) {

        // 1. Localiza a nota
        Entrada entrada = entradaRepository.findByNumeroNota(numeroNota)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Nota Fiscal nº " + numeroNota + " não encontrada."
                        ));

        // 2. Impede estorno duplicado
        if (Integer.valueOf(2).equals(entrada.getStatus())) {
            throw new RuntimeException(
                    "A Nota Fiscal nº " + numeroNota + " já foi devolvida."
            );
        }

        // 3. Percorre os produtos desta entrada
        for (EntradaProdutos item : entrada.getItens()) {

            Produto produto = item.getProduto();
            int quantidade = item.getQuantidade();

            // PRODUTO A GRANEL
            if (Boolean.TRUE.equals(produto.getAGranel())) {

                BigDecimal qtdDevolver =
                        BigDecimal.valueOf(quantidade);

                BigDecimal estoqueAtual =
                        produto.getEstoque() == null
                                ? BigDecimal.ZERO
                                : produto.getEstoque();

                if (estoqueAtual.compareTo(qtdDevolver) < 0) {
                    throw new RuntimeException(
                            "Estoque insuficiente para devolver o produto: "
                                    + produto.getNome()
                    );
                }

                produto.setEstoque(
                        estoqueAtual.subtract(qtdDevolver)
                );

            } else {

                // PRODUTO NORMAL
                if (produto.getEstoqueAtual() < quantidade) {
                    throw new RuntimeException(
                            "Estoque insuficiente para devolver o produto: "
                                    + produto.getNome()
                    );
                }

                produto.setEstoqueAtual(
                        produto.getEstoqueAtual() - quantidade
                );
            }

            produtoRepository.save(produto);
        }

        // 4. Marca a nota como devolvida
        entrada.setStatus(2);

        // 5. Preserva a entrada no histórico
        return entradaRepository.save(entrada);
    }
    
    public List<Map<String, Object>> listarNotasAtivasResumo() {
        // 1. Busca os dados cruzados usando o novo método do repository
        List<Object[]> resultados = entradaRepository.findNotasAtivasResumoComValor(1);
        
        // 2. Transforma cada linha do banco no mapa correto pro front-end
        return resultados.stream().map(linha -> {
            Map<String, Object> map = new java.util.HashMap<>();
            
            Long id = (Long) linha[0];
            String numeroNota = (String) linha[1];
            String fornecedorNome = (String) linha[2];
            
            // Trata o valor total com segurança (pode vir BigDecimal, Double, etc.)
            String valorTotalStr = "0.00";
            if (linha[3] != null) {
                valorTotalStr = String.format("%.2f", Double.parseDouble(linha[3].toString()));
            }

            // Dados individuais para o JavaScript do front-end ler
            map.put("id", id); 
            map.put("numeroNota", numeroNota);
            map.put("fornecedorNome", fornecedorNome);
            map.put("valorTotalNota", valorTotalStr);
            
            // Monta o texto amigável que vai aparecer na lista do select da tela!
            String textoExibicao = String.format("Nota ID: %d (NF: %s) - Fornecedor: %s - Total: R$ %s",
                id, numeroNota, fornecedorNome, valorTotalStr
            );
            map.put("label", textoExibicao);
            
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }
   
    // ↩️ METODO CRÍTICO: Executa o estorno da nota e devolve/subtrai o estoque físico
    @org.springframework.transaction.annotation.Transactional
    public Entrada estornarEntrada(Long entradaId) {
        // 1. Busca a entrada pelo ID
        Entrada entrada = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new RuntimeException("Nota de entrada não encontrada com o ID: " + entradaId));

        // 2. Valida se ela já foi estornada antes para evitar duplicidade de estorno
        if (entrada.getStatus() != null && entrada.getStatus() == 2) {
            throw new RuntimeException("Aviso: Esta nota fiscal já foi estornada anteriormente no sistema.");
        }

        // 3. Varre a lista de itens da nota e devolve (subtrai) o estoque físico de cada produto
        if (entrada.getItens() != null) {
            for (com.material.model.EntradaProdutos item : entrada.getItens()) {
                com.material.model.Produto produto = item.getProduto();
                
                if (produto != null) {
                    // Pega o estoque atual e subtrai a quantidade que havia entrado pela nota
                	int estoqueAtual = produto.getEstoqueAtual();
                	int qtdNota = item.getQuantidade() != null ? item.getQuantidade() : 0;

                	int novoEstoque = estoqueAtual - qtdNota;  
                    // Alerta preventivo se o estoque for ficar negativo (opcional, mas seguro pro balcão)
                    if (novoEstoque < 0) {
                        System.out.println("⚠️ Alerta: Estoque do produto ID " + produto.getId() + " ficou negativo (" + novoEstoque + ") após estorno.");
                    }
                    
                    produto.setEstoqueAtual(novoEstoque);
                    // Como o produtoRepository deve estar injetado no seu service, salvamos o novo saldo
                    produtoRepository.save(produto);
                }
            }
        }

        // 4. Muda o status do cabeçalho da nota para 2 (Estornada)
//        entrada.setStatus(2);
        
        // 5. Salva a nota atualizada e retorna para o controller
//        return entradaRepository.save(entrada);
        
     // 4. Muda o status do cabeçalho da nota para 2 (Estornada)
        entrada.setStatus(2);

        // 5. Salva a nota atualizada
        Entrada entradaEstornada =
                entradaRepository.save(entrada);

        // 6. Registra o movimento de devolução no histórico
        entradaMovimentoService.registrarDevolucao(
                entradaEstornada
        );

        // 7. Retorna para o controller
        return entradaEstornada;
      
    }
    
    // 🔍 NOVO MÉTODO: Filtra as notas fiscais por período para o select do painel flutuante
    public List<java.util.Map<String, Object>> buscarEntradasPorPeriodo(java.time.LocalDate inicio, java.time.LocalDate fim) {
        
        // 1. Executa a sua query nativa do EntradaRepository que retorna a lista de DTOs
        List<com.material.dto.EntradaPeriodoDTO> entradasDto = entradaRepository.buscarEntradasPorPeriodo(inicio, fim);
        
        // 2. Converte os DTOs em um mapa leve para o JavaScript ler sem complicação
        return entradasDto.stream().map(dto -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            
            // Garanta que seu EntradaPeriodoDTO tenha esses métodos getters criados!
            map.put("id", dto.getId()); 
            
            // Verifica se a nota está ativa ou estornada (opcional, assume ativa se o DTO não trouxer o status)
            String statusTexto = "🟩 Ativa"; 
            
            // Monta o texto amigável pro pião ler na lista suspensa do balcão
            String label = String.format("Nota: %s | Fornecedor: %s | Dt: %s | Total: R$ %s | [%s]",
                    dto.getNumeroNota(),
                    dto.getFornecedorNome(), // Nome do getter do fornecedor no seu EntradaPeriodoDTO
                    dto.getDataRecebimento() != null ? dto.getDataRecebimento().toString() : "Sem Data",
                 //   dto.getValorTotalNota() != null ? dto.getValorTotalNota().toString() : "0.00",
                   		dto.getValorTotal() != null ? dto.getValorTotal().toString() : "0.00",
                    		
                   		statusTexto);
                    
            map.put("label", label);
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }
 // 🟩 ADICIONADO: Garante que o Hibernate mantenha a conexão aberta para ler a lista de itens sem quebrar!
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Map<String, Object> buscarItensDaEntrada(Long entradaId) {
        
        // 1. Busca a entrada pelo ID
        Entrada entrada = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new RuntimeException("Nota de entrada não encontrada com o ID: " + entradaId));

        Map<String, Object> resultado = new java.util.HashMap<>();
        
        resultado.put("fornecedor", entrada.getFornecedor() != null ? entrada.getFornecedor().getNome() : "Não Informado");
        resultado.put("valorTotal", entrada.getValorTotal()); 
        resultado.put("status", entrada.getStatus());

        // 2. Converte a lista de itens (Essa linha que dava o estouro sem o @Transactional)
        List<Map<String, Object>> itensMap = entrada.getItens().stream().map(item -> {
            Map<String, Object> i = new java.util.HashMap<>();
            i.put("produtoDescricao", item.getProduto() != null ? item.getProduto().getNome() : "Produto Sem Descrição");
            i.put("quantidade", item.getQuantidade());
            i.put("precoCusto", item.getPrecoCusto());
            i.put("total", item.getTotal());
            return i;
        }).collect(java.util.stream.Collectors.toList());

        resultado.put("itens", itensMap);
        return resultado;
    }
    
    
}