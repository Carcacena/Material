package com.material.service;

import com.material.model.Fornecedor;
import com.material.repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FornecedorService {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Autowired
    private FornecedorRepository repository;

    public List<Fornecedor> listarTodos() {
        return fornecedorRepository.findAll();
    }

    public Fornecedor salvar(Fornecedor fornecedor) {
        return fornecedorRepository.save(fornecedor);
    }
    public Fornecedor atualizar(Long id, Fornecedor atualizado) {
        return repository.findById(id).map(fornecedor -> {
            fornecedor.setNome(atualizado.getNome());
            fornecedor.setCnpj(atualizado.getCnpj());
            fornecedor.setInscricaoEstadual(atualizado.getInscricaoEstadual());
            fornecedor.setEmail(atualizado.getEmail());
            fornecedor.setTelefone(atualizado.getTelefone());
            fornecedor.setCep(atualizado.getCep());
            fornecedor.setLogradouro(atualizado.getLogradouro());
            fornecedor.setNumero(atualizado.getNumero());
            fornecedor.setComplemento(atualizado.getComplemento());
            fornecedor.setBairro(atualizado.getBairro());
            fornecedor.setCidade(atualizado.getCidade());
            fornecedor.setUf(atualizado.getUf());
            return repository.save(fornecedor);
        }).orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com o ID: " + id));
    }
    
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Fornecedor não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }
    
    

    public void excluir(Long id) {
        fornecedorRepository.deleteById(id);
    }

    public Fornecedor buscarPorId(Long id) {
        return fornecedorRepository.findById(id).orElse(null);
    }
}