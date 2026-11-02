package com.material.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.material.dto.ProdutoDTO;
import com.material.model.Produto;
import com.material.model.Fornecedor;
import com.material.repository.ProdutoRepository;
import com.material.repository.FornecedorRepository; // Adicione o import do seu FornecedorRepository

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository; // Injetado para buscar o fornecedor pelo ID

    public ProdutoService(ProdutoRepository produtoRepository, FornecedorRepository fornecedorRepository) {
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
    }

    // =========================
    // CONSULTAS
    // =========================
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    // =========================
    // MANUTENÇÃO (Afinada para usar o DTO e controlar a consistência)
    // =========================
    public Produto salvarNovo(ProdutoDTO dto) {
        // 🚨 REGRA DE CONSISTÊNCIA: Poka-Yoke contra margem negativa ou zerada
        if (dto.getPrecoVenda() == null || dto.getPrecoCusto() == null || 
            dto.getPrecoVenda().compareTo(dto.getPrecoCusto()) < 0) {
            throw new IllegalArgumentException("Erro de consistência comercial: Preço de venda menor que o preço de custo!");
        }

        Produto produto = new Produto();
        
        // Transferindo os dados do Buffer (DTO) para a tabela real (Entity)
        produto.setNome(dto.getNome());
        produto.setAGranel(dto.getAGranel());
        produto.setPrecoCusto(dto.getPrecoCusto());
        produto.setPrecoVenda(dto.getPrecoVenda());
        produto.setDataValidade(dto.getDataValidade());
        
        // 🆕 Passando as novas variáveis de rotatividade para o banco
        produto.setEstoqueAtual(dto.getEstoqueAtual());
        produto.setQteEntrada(dto.getEstoqueAtual()); // Na inclusão do produto novo, a última entrada é o próprio saldo inicial

        // Busca o fornecedor no banco para garantir a integridade da chave estrangeira
        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
        produto.setFornecedor(fornecedor);

        return produtoRepository.save(produto);
    }

    public Produto atualizar(Long id, ProdutoDTO dto) {
        Produto produtoExistente = buscarPorId(id);

        if (dto.getPrecoVenda().compareTo(dto.getPrecoCusto()) < 0) {
            throw new IllegalArgumentException("Erro de consistência comercial: Preço de venda menor que o preço de custo!");
        }

        produtoExistente.setNome(dto.getNome());
        produtoExistente.setAGranel(dto.getAGranel());
        produtoExistente.setPrecoCusto(dto.getPrecoCusto());
        produtoExistente.setPrecoVenda(dto.getPrecoVenda());
        produtoExistente.setDataValidade(dto.getDataValidade());
        
        // Na alteração simples, atualizamos apenas se a tela permitir, mas mantendo a integridade
        produtoExistente.setEstoqueAtual(dto.getEstoqueAtual());

        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
        produtoExistente.setFornecedor(fornecedor);

        return produtoRepository.save(produtoExistente);
    }

    public void excluir(Long id) {
        produtoRepository.deleteById(id);
    }
}
