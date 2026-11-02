package com.material.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.material.model.OrigemSistema;
import com.material.repository.OrigemSistemaRepository;

@Service
public class OrigemSistemaService {
	
    @Autowired
    private OrigemSistemaRepository repository;

    /**
     * 🌟 NOVO MÉTODO COMPROMISSO: Busca a filial que está configurada como a origem local 
     * física deste sistema para sair nos relatórios.
     */
    public OrigemSistema obterDadosEmpresa() {
        return repository.findAll().stream()
                .filter(os -> os.getOrigemSistema() != null && os.getOrigemSistema())
                .findFirst()
                .orElse(new OrigemSistema()); // Se não achar nenhuma marcada, retorna objeto vazio
    }

    public List<OrigemSistema> listarTodos() {
        return repository.findAll();
    }

    @Transactional
    public OrigemSistema salvar(OrigemSistema origemsistema) {
        // ⚡ REGRA DE OURO: Se esta nova filial for a Origem Ativa (True), desmarca todas as outras
        if (origemsistema.getOrigemSistema() != null && origemsistema.getOrigemSistema()) {
            desmarcarOutrasOrigens(origemsistema.getId());
        }
        return repository.save(origemsistema);
    }

    @Transactional
    public OrigemSistema atualizar(Long id, OrigemSistema atualizado) {
        return repository.findById(id).map(origemsistema -> {
            origemsistema.setNome(atualizado.getNome());
            origemsistema.setCnpj(atualizado.getCnpj());
            origemsistema.setInscricaoEstadual(atualizado.getInscricaoEstadual());
            origemsistema.setEmail(atualizado.getEmail());
            origemsistema.setTelefone(atualizado.getTelefone());
            origemsistema.setCep(atualizado.getCep());
            origemsistema.setLogradouro(atualizado.getLogradouro());
            origemsistema.setNumero(atualizado.getNumero());
            origemsistema.setComplemento(atualizado.getComplemento());
            origemsistema.setBairro(atualizado.getBairro());
            origemsistema.setCidade(atualizado.getCidade());
            origemsistema.setUf(atualizado.getUf());
            origemsistema.setUnidadeAtiva(atualizado.getUnidadeAtiva());
            
            // ⚡ Atualiza o status de origem vindo da alteração da tela
            origemsistema.setOrigemSistema(atualizado.getOrigemSistema());

            // ⚡ REGRA DE OURO: Se foi alterada para Origem Ativa (True), desmarca as outras
            if (origemsistema.getOrigemSistema() != null && origemsistema.getOrigemSistema()) {
                desmarcarOutrasOrigens(id);
            }

            return repository.save(origemsistema);
        }).orElseThrow(() -> new RuntimeException("Origem Sistema não encontrado com o ID: " + id));
    }
    
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Origem Sistema não encontrado com o ID: " + id);
        }
        repository.deleteById(id);
    }
    
    /**
     * ⚡ MÉTODO AUXILIAR: Varre o banco tirando o "S" (True) das outras filiais, 
     * garantindo que apenas uma seja a origem ativa por instalação.
     */
    private void desmarcarOutrasOrigens(Long idAtual) {
        List<OrigemSistema> listaCompleta = repository.findAll();
        for (OrigemSistema os : listaCompleta) {
            if (idAtual == null || !os.getId().equals(idAtual)) {
                if (os.getOrigemSistema() != null && os.getOrigemSistema()) {
                    os.setOrigemSistema(false);
                    repository.save(os); // Atualiza no banco para 'False'
                }
            }
        }
    }
}