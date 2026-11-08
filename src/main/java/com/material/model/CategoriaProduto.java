package com.material.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria_produto")
public class CategoriaProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nome;

    // ======================
    // CONSTRUTORES
    // ======================
    public CategoriaProduto() {
    }

    public CategoriaProduto(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    // ======================
    // GETTERS E SETTERS
    // ======================
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}