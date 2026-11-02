package com.material.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.material.model.Cliente;

import com.material.repository.ClienteRepository;

@Service
public class ClienteService {
	
	 @Autowired
	    private ClienteRepository clienteRepository;

	    @Autowired
	    private ClienteRepository repository;

	    public List<Cliente> listarTodos() {
	        return clienteRepository.findAll();
	    }

	    public Cliente salvar(Cliente cliente) {
	        return clienteRepository.save(cliente);
	    }
	    public Cliente atualizar(Long id, Cliente atualizado) {
	        return repository.findById(id).map(cliente -> {
	            cliente.setNome(atualizado.getNome());
	            cliente.setCnpj(atualizado.getCnpj());
	            cliente.setInscricaoEstadual(atualizado.getInscricaoEstadual());
	            cliente.setEmail(atualizado.getEmail());
	            cliente.setTelefone(atualizado.getTelefone());
	            cliente.setCep(atualizado.getCep());
	            cliente.setLogradouro(atualizado.getLogradouro());
	            cliente.setNumero(atualizado.getNumero());
	            cliente.setComplemento(atualizado.getComplemento());
	            cliente.setBairro(atualizado.getBairro());
	            cliente.setCidade(atualizado.getCidade());
	            cliente.setUf(atualizado.getUf());
	            return repository.save(cliente);
	        }).orElseThrow(() -> new RuntimeException("Cliente não encontrado com o ID: " + id));
	    }
	    
	    public void deletar(Long id) {
	        if (!repository.existsById(id)) {
	            throw new RuntimeException("Cliente não encontrado com o ID: " + id);
	        }
	        repository.deleteById(id);
	    }
	
	    public void excluir(Long id) {
	        clienteRepository.deleteById(id);
	    }

	    public Cliente buscarPorId(Long id) {
	        return clienteRepository.findById(id).orElse(null);
	    }
	    
}
	    
	    
	    
	    
	    