package com.material.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "cliente")
public class Cliente {

	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;
	    
	    @NotBlank(message = "O nome/razão social é obrigatório")
	    @Size(min = 2, max = 150, message = "O nome deve ter entre 2 e 150 caracteres")
	    @Column(nullable = false, length = 150)
	    private String nome;
	   
	    @NotBlank(message = "O documento é obrigatório")
	    // ⚡ AJUSTADO: A expressão aceita 11 dígitos (CPF) OU 14 dígitos (CNPJ) sem travar!
	    @Pattern(regexp = "\\d{11}|\\d{14}", message = "O documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)")
	    @Column(nullable = false, unique = true, length = 14)
	    private String cnpj;

	    // ⚡ INCLUSÃO: Mapeamento da nova coluna de Inscrição Estadual
	    @Column(name = "inscricao_estadual", length = 15)
	    private String inscricaoEstadual;

	    @Email(message = "E-mail inválido")
	    @Column(length = 100)
	    private String email;
	    
	    @Column(length = 20)
	    private String telefone;
	    
	    @NotBlank(message = "O CEP é obrigatório")
	    @Pattern(regexp = "\\d{8}", message = "O CEP deve conter exatamente 8 dígitos numéricos")
	    @Column(nullable = false, length = 8)
	    private String cep;
	    
	    @NotBlank(message = "O logradouro/rua é obrigatório")
	    @Column(nullable = false, length = 150)
	    private String logradouro;
	    
	    @NotBlank(message = "O número é obrigatório")
	    @Column(nullable = false, length = 20)
	    private String numero;
	    
	    @Column(length = 100)
	    private String complemento;
	    
	    @NotBlank(message = "O bairro é obrigatório")
	    @Column(nullable = false, length = 80)
	    private String bairro;
	    
	    @NotBlank(message = "A cidade é obrigatória")
	    @Column(nullable = false, length = 100)
	    private String cidade;
	    
	    @NotBlank(message = "A UF é obrigatória")
	    @Size(min = 2, max = 2, message = "A UF deve conter exatamente 2 caracteres")
	    @Column(nullable = false, length = 2)
	    private String uf;
	    
	   
	    public Long getId() { return id; }
	    public void setId(Long id) { this.id = id; }

	    public String getNome() { return nome; }
	    public void setNome(String nome) { this.nome = nome; }

	    public String getCnpj() { return cnpj; }
	    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

	    // ⚡ INCLUSÃO: Getters e Setters para a Inscrição Estadual ler o JSON do front
	    public String getInscricaoEstadual() { return inscricaoEstadual; }
	    public void setInscricaoEstadual(String inscricaoEstadual) { this.inscricaoEstadual = inscricaoEstadual; }

	    public String getEmail() { return email; }
	    public void setEmail(String email) { this.email = email; }

	    public String getTelefone() { return telefone; }
	    public void setTelefone(String telefone) { this.telefone = telefone; }

	    public String getCep() { return cep; }
	    public void setCell(String cep) { this.cep = cep; } // Mantido seu padrão anterior
	    public void setCep(String cep) { this.cep = cep; }

	    public String getLogradouro() { return logradouro; }
	    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }

	    public String getNumero() { return numero; }
	    public void setNumero(String numero) { this.numero = numero; }

	    public String getComplemento() { return complemento; }
	    public void setComplemento(String complemento) { this.complemento = complemento; }

	    public String getBairro() { return bairro; }
	    public void setBairro(String bairro) { this.bairro = bairro; }

	    public String getCidade() { return cidade; }
	    public void setCidade(String cidade) { this.cidade = cidade; }

	    public String getUf() { return uf; }
	    public void setUf(String uf) { this.uf = uf; }

	    
	    
	    
	    
	}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    