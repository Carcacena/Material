package com.material.service;

import com.material.dto.EntradaImpostosDTO;
import com.material.model.Entrada;
import com.material.model.EntradaImpostos;
import com.material.repository.EntradaImpostosRepository;
import com.material.repository.EntradaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntradaImpostosService {

    @Autowired
    private EntradaImpostosRepository impostosRepository;

    @Autowired
    private EntradaRepository entradaRepository;

    // 💾 Salva ou atualiza os impostos da nota — nunca duplica (1 nota = 1 registro de impostos)
    @Transactional
    public EntradaImpostos salvarOuAtualizar(Long entradaId, EntradaImpostosDTO dto) {
        Entrada entrada = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada: " + entradaId));

        // Se já existe registro de impostos pra essa nota, reaproveita (evita duplicar)
        EntradaImpostos impostos = impostosRepository.findByEntrada_Id(entradaId)
                .orElse(new EntradaImpostos());

        impostos.setEntrada(entrada);
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

        return impostosRepository.save(impostos);
    }

    public EntradaImpostos buscarPorEntrada(Long entradaId) {
        return impostosRepository.findByEntrada_Id(entradaId)
                .orElseThrow(() -> new RuntimeException("Nenhum imposto lançado para essa nota ainda."));
    }
}