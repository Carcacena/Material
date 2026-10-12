package com.material.repository;


import com.material.model.EntradaImpostos;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EntradaImpostosRepository extends JpaRepository<EntradaImpostos, Long> {
    // 🎯 Adicione o sublinhado para casar com o Controller
    Optional<EntradaImpostos> findByEntrada_Id(Long entradaId);

	
}