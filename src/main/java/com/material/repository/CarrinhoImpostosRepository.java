package com.material.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.material.model.CarrinhoImpostos;



public interface CarrinhoImpostosRepository
		extends JpaRepository<CarrinhoImpostos, Long>{
	
	 // 🎯 Adicione o sublinhado para casar com o Controller
    Optional<CarrinhoImpostos> findByCarrinho_Id(Long carrinhoId); 
	
	

}
