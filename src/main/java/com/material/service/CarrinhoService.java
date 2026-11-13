package com.material.service;

import com.material.model.Carrinho;
import com.material.model.Produto;
import com.material.repository.CarrinhoRepository;
import com.material.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CarrinhoService {

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;
    @Autowired
    
    private CarrinhoMovimentoService carrinhoMovimentoService;
  
    // 🔍 Camada de serviço que lê os detalhes do pedido completo trazidos com JOIN FETCH do banco
    public List<Carrinho> listarItensStandby(String numeroPedido) {
        return carrinhoRepository.buscarPedidoComRelacionamentos(numeroPedido);
    }

    // 🟢 Grava o rascunho temporário no MySQL com STATUS = 0 (Em Standby de Balcão)
    public Carrinho salvarItemNoCarrinho(Carrinho carrinho) {
        carrinho.setStatus(0); // 🌟 REGRA NOVA: 0 significa item em montagem no cupom
        return carrinhoRepository.save(carrinho);
    }

    // 🔴 Limpa a tabela temporária de um cupom específico (Precisa do @Transactional)
    @Transactional
    public void limparCarrinhoDoPedido(String numeroPedido) {
        carrinhoRepository.deleteByNumeroPedido(numeroPedido);
    }

    // 💸 CONSOLIDA A VENDA: Baixa estoque, vincula o cliente real e muda o status para FATURADO ATIVO (Status = 1)
    @Transactional
    public void faturarCarrinhoDoPedido(String numeroPedido, Long clienteIdDefinitivo) {
        // 🌟 BUSCA BLINDADA: Localiza os itens que estavam em standby (status = 0)
        List<Carrinho> itensStandby = carrinhoRepository.findByNumeroPedidoAndStatus(numeroPedido, 0);

        if (itensStandby.isEmpty()) {
            throw new RuntimeException("Erro: Não há nenhum item pendente para faturamento para este pedido.");
        }

        for (Carrinho item : itensStandby) {
            Produto produto = item.getProduto();
            if (produto == null) {
                throw new RuntimeException("Erro grave: Produto não vinculado ao item do carrinho.");
            }

            int novoEstoque = produto.getEstoqueAtual() - item.getQuantidade().intValue();
            if (novoEstoque < 0) {
                throw new RuntimeException("Estoque insuficiente no banco para o produto: " + produto.getNome());
            }

            produto.setEstoqueAtual(novoEstoque);
            produtoRepository.save(produto);

            com.material.model.Cliente clienteDefinitivo = new com.material.model.Cliente();
            clienteDefinitivo.setId(clienteIdDefinitivo);
            item.setCliente(clienteDefinitivo);

            // 🌟 O XEQUE-MATE DO MOTOR DE SAÍDAS: Carimba de forma definitiva o Status = 1 (Nota Fiscal Ativa/Faturada)
            item.setStatus(1); 
            //carrinhoRepository.save(item);
            Carrinho carrinhoSalvo = carrinhoRepository.save(item);

            carrinhoMovimentoService.registrarCarrinho(carrinhoSalvo);
        }
    }

    // 🔄 DEVOLUÇÃO: Estorna estoque e grava novo registro com status = 2, sem alterar o faturado original
    @Transactional
    public void devolverItem(Long itemId) {
        Carrinho itemFaturado = carrinhoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado para devolução."));

        // 🌟 ALINHAMENTO: Só aceita devolver se a nota original estiver faturada/ativa (status = 1)
        if (itemFaturado.getStatus() != 1) {
            throw new RuntimeException("Só é possível devolver itens que estejam faturados e ativos.");
        }

        Produto produto = itemFaturado.getProduto();
        if (produto == null) {
            throw new RuntimeException("Erro grave: Produto não vinculado ao item do carrinho.");
        }

        int estoqueEstornado = produto.getEstoqueAtual() + itemFaturado.getQuantidade().intValue();
        produto.setEstoqueAtual(estoqueEstornado);
        produtoRepository.save(produto);

        Carrinho devolucao = new Carrinho();
        devolucao.setNumeroPedido(itemFaturado.getNumeroPedido());
        devolucao.setCliente(itemFaturado.getCliente());
        devolucao.setProduto(produto);
        devolucao.setQuantidade(itemFaturado.getQuantidade());
        devolucao.setPrecoPraticado(itemFaturado.getPrecoPraticado());

        devolucao.setNumeroNotaFiscal(itemFaturado.getNumeroNotaFiscal());
        devolucao.setSerie(itemFaturado.getSerie());

        // 🌟 ALINHAMENTO: Carimba o Status = 2 para registrar o estorno/devolução comercial
        devolucao.setStatus(2);
        devolucao.setDataCriacao(LocalDateTime.now());

        Carrinho devolucaoSalva = carrinhoRepository.save(devolucao);

        carrinhoMovimentoService.registrarDevolucao(devolucaoSalva);
    }

    // 🔄 Versão em lote, pra quando o operador marca várias caixinhas "Devolver" de uma vez
    @Transactional
    public void devolverItens(List<Long> itemIds) {
        for (Long id : itemIds) {
            devolverItem(id);
        }
    }

    public List<Carrinho> pesquisarPedidosPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.plusDays(1).atStartOfDay().minusNanos(1);
        return carrinhoRepository.findByDataCriacaoBetweenOrderByDataCriacaoDesc(inicio, fim);
    }

    public List<Carrinho> pesquisarTodosItensDoPedido(String numeroPedido) {
        return carrinhoRepository.findByNumeroPedidoOrderByIdAsc(numeroPedido);
    }

    // 🔴 Deleta um único item do carrinho usando o repositório existente
    @Transactional
    public void excluirItemPorId(Long id) {
        carrinhoRepository.deleteById(id);
    }
}