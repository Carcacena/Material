package com.material.dto;

import java.util.List;

public class UsuarioDTO {
	  private Long id;
	    private String login;
	    private String perfil;
	    private int tipo;

	    public UsuarioDTO(Long id, String login, String perfil, int tipo) {
	        this.id = id;
	        this.login = login;
	        this.perfil = perfil;
	        this.tipo = tipo;
	    }

	    public String getLogin() {
	        return login;
	    }

	    public String getPerfil() {
	        return perfil;
	    }

	    public int getTipo() {
	        return tipo;
	    }
	}


