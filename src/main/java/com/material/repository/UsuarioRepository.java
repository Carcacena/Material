package com.material.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.material.*;
import com.material.model.Usuario;

	
	

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Usuario findByLogin(String login);

}


