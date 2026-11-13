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
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "origemsistema")
public class OrigemSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "O nome/razão social é obrigatório")
    @Size(min = 2, max = 150, message = "O nome deve ter entre 2 e 150 caracteres")
    @Column(nullable = false, length = 150)
    private String nome;
   
    @NotBlank(message = "O documento é obrigatório")
    @Pattern(regexp = "\\d{11}|\\d{14}", message = "O documento deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ)")
    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

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
    
 // ... Seus atributos anteriores permanecem os mesmos ...

    @NotBlank(message = "O número da nota fiscal é obrigatório")
    @Column(nullable = false, length = 20)
    private String notafiscal;

    // 🌟 INCLUSÃO: Atributo para capturar a Série Fiscal (UN, B1, etc.)
    @NotBlank(message = "A série da nota fiscal é obrigatória")
    @Size(max = 10, message = "A série deve conter no máximo 10 caracteres")
    @Column(nullable = false, length = 10)
    //private String serie = "UN";
    private String serie; 

    @NotNull(message = "O status de unidade ativa é obrigatório")
    @Column(name = "unidade_ativa", nullable = false)
    private Boolean unidadeAtiva = true;

    @NotNull(message = "O status de origem do sistema é obrigatório")
    @Column(name = "origem_sistema", nullable = false)
    private Boolean origemSistema = false;

    // --- GETTERS E SETTERS PADRÃO ---

   
	
	public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getInscricaoEstadual() { return inscricaoEstadual; }
    public void setInscricaoEstadual(String inscricaoEstadual) { this.inscricaoEstadual = inscricaoEstadual; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getCep() { return cep; }
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
    
    public String getNotafiscal() {
  		return notafiscal;
  	}
  	public void setNotafiscal(String notafiscal) {
  		this.notafiscal = notafiscal;
  	}
 
    public String getSerie() {
		return serie;
	}
	public void setSerie(String serie) {
		this.serie = serie;
	}
	public Boolean getUnidadeAtiva() { return unidadeAtiva; }
    public void setUnidadeAtiva(Boolean unidadeAtiva) { this.unidadeAtiva = unidadeAtiva; }

  
	public Boolean getOrigemSistema() { return origemSistema; }
    public void setOrigemSistema(Boolean origemSistema) { this.origemSistema = (origemSistema != null) ? origemSistema : false; }

    // ⚡ MÉTODOS AUXILIARES PARA INTEGRAÇÃO COM A TELA (S/N)
    
    @Transient // Não cria coluna no banco, serve apenas para ler o dado formatado na tela
    public String getOrigemSistemaTela() {
        return (this.origemSistema != null && this.origemSistema) ? "S" : "N";
    }

    // Intercepta a String "S" ou "N" do formulário e converte para Boolean antes de salvar
    public void setOrigemSistemaTela(String origem) {
        if (origem != null && (origem.equalsIgnoreCase("S") || origem.equalsIgnoreCase("Sim"))) {
            this.origemSistema = true;
        } else {
            this.origemSistema = false;
        }
    }
}