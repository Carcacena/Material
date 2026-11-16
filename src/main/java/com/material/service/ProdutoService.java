package com.material.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.material.dto.ProdutoDTO;
import com.material.model.Produto;
import com.material.model.ProdutoFarmacia;
import com.material.model.Fornecedor;
import com.material.model.CategoriaProduto;
import com.material.repository.ProdutoRepository;
import com.material.repository.FornecedorRepository;
import com.material.repository.CategoriaProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final CategoriaProdutoRepository categoriaProdutoRepository;

    public ProdutoService(ProdutoRepository produtoRepository, 
                          FornecedorRepository fornecedorRepository,
                          CategoriaProdutoRepository categoriaProdutoRepository) {
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.categoriaProdutoRepository = categoriaProdutoRepository;
    }

    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    @Transactional
    public Produto salvarNovo(ProdutoDTO dto) {
        if (dto.getPrecoCusto() == null) {
            throw new IllegalArgumentException("Preço de custo não foi enviado.");
        }
        if (dto.getPrecoVenda() == null) {
            throw new IllegalArgumentException("Preço de venda não foi enviado.");
        }
        if (dto.getPrecoVenda().compareTo(dto.getPrecoCusto()) < 0) {
            throw new IllegalArgumentException("Preço de venda menor que o preço de custo.");
        }

        if (dto.getFornecedor() == null || dto.getFornecedor().getId() == null) {
            throw new IllegalArgumentException("FornecedorId obrigatório não enviado no lote.");
        }
        if (dto.getCategoria() == null || dto.getCategoria().getId() == null) {
            throw new IllegalArgumentException("CategoriaId obrigatória não enviada no lote.");
        }

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setCodigoBarras(dto.getCodigoBarras());
        produto.setAGranel(dto.getAGranel());
        produto.setPrecoCusto(dto.getPrecoCusto());
        produto.setPrecoVenda(dto.getPrecoVenda());
        produto.setDataValidade(dto.getDataValidade());
        produto.setEstoqueAtual(dto.getEstoqueAtual());
        produto.setQteEntrada(dto.getEstoqueAtual());

        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedor().getId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
        produto.setFornecedor(fornecedor);

        CategoriaProduto categoria = categoriaProdutoRepository.findById(dto.getCategoria().getId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        produto.setCategoria(categoria);

        // 💊 Se vierem dados farmacêuticos (Categoria REMÉDIOS), acopla na tabela satélite
        vincularDadosFarmacia(produto, dto);

        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto atualizar(Long id, ProdutoDTO dto) {
        Produto produtoExistente = buscarPorId(id);

        if (dto.getPrecoVenda().compareTo(dto.getPrecoCusto()) < 0) {
            throw new IllegalArgumentException("Erro de consistência comercial: Preço de venda menor que o preço de custo!");
        }

        if (dto.getFornecedor() == null || dto.getFornecedor().getId() == null) {
            throw new IllegalArgumentException("FornecedorId obrigatório não enviado para atualização.");
        }
        if (dto.getCategoria() == null || dto.getCategoria().getId() == null) {
            throw new IllegalArgumentException("CategoriaId obrigatória não enviada para atualização.");
        }

        produtoExistente.setNome(dto.getNome());
        produtoExistente.setCodigoBarras(dto.getCodigoBarras());
        produtoExistente.setAGranel(dto.getAGranel());
        produtoExistente.setPrecoCusto(dto.getPrecoCusto());
        produtoExistente.setPrecoVenda(dto.getPrecoVenda());
        produtoExistente.setDataValidade(dto.getDataValidade());
        produtoExistente.setEstoqueAtual(dto.getEstoqueAtual());

        Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedor().getId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
        produtoExistente.setFornecedor(fornecedor);

        CategoriaProduto categoriaAlterada = categoriaProdutoRepository.findById(dto.getCategoria().getId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        produtoExistente.setCategoria(categoriaAlterada);

        // 💊 Atualiza ou remove os dados farmacêuticos conforme a categoria
        vincularDadosFarmacia(produtoExistente, dto);

        return produtoRepository.save(produtoExistente);
    }

    private void vincularDadosFarmacia(Produto produto, ProdutoDTO dto) {
        boolean temDadosFarmacia = dto.getRegistroMs() != null && !dto.getRegistroMs().isBlank();

        if (temDadosFarmacia) {
            ProdutoFarmacia farmacia = produto.getDadosFarmacia();
            if (farmacia == null) {
                farmacia = new ProdutoFarmacia();
            }
            farmacia.setRegistroMs(dto.getRegistroMs().trim());
            farmacia.setPrincipioAtivo(dto.getPrincipioAtivo() != null ? dto.getPrincipioAtivo().trim() : "");
            farmacia.setLote(dto.getLote() != null ? dto.getLote().trim() : "");
            farmacia.setPmc(dto.getPmc());
            farmacia.setTipoTarja(
                dto.getTipoTarja() != null && !dto.getTipoTarja().isBlank()
                    ? ProdutoFarmacia.TipoTarja.valueOf(dto.getTipoTarja().toUpperCase())
                    : ProdutoFarmacia.TipoTarja.MIP
            );
            produto.setDadosFarmacia(farmacia);
        } else {
            // Se mudou a categoria para não-farmácia, limpa o vínculo satélite
            produto.setDadosFarmacia(null);
        }
    }

    public void excluir(Long id) {
        produtoRepository.deleteById(id);
    }
}