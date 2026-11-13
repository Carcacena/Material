package com.material.model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario")
public class Usuario {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String login;
	    private String senha;
	    @Column(nullable = false)
	 
	    private String perfil;
	    private int tipo; // 0=super admin, 1=admin, 2=usuario

	    public Long getId() {
	        return id;
	    }

	    public void setId(Long id) {
	        this.id = id;
	    }

	    public String getLogin() {
	        return login;
	    }

	    public void setLogin(String login) {
	        this.login = login;
	    }

	    public String getSenha() {
	        return senha;
	    }

	    public void setSenha(String senha) {
	        this.senha = senha;
	    }

	    public String getPerfil() {
	        return perfil;
	    }

	    public void setPerfil(String perfil) {
	        this.perfil = perfil;
	    }

	    public int getTipo() {
	        return tipo;
	    }

	    public void setTipo(int tipo) {
	        this.tipo = tipo;
	    }
	}


