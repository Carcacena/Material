package com.material.service;

import com.material.model.LogSistema;
import com.material.repository.LogSistemaRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LogSistemaService {

    private final LogSistemaRepository repository;

    public LogSistemaService(LogSistemaRepository repository) {
        this.repository = repository;
    }

    public void registrar(
            String usuario,
            String acao,
            String detalhe,
            boolean sucesso) {

        LogSistema log = new LogSistema();

        log.setDataHora(LocalDateTime.now());
        log.setUsuario(usuario);
        log.setAcao(acao);
        log.setDetalhe(detalhe);
        log.setSucesso(sucesso);

        repository.save(log);
        System.out.println(">>> LOG SISTEMA GRAVADO NO REPOSITORY");
    }
    
    

  
    
    
    

}