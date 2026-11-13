package com.material.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entrada_movimento")
public class EntradaMovimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrada_id", nullable = false)
    private Entrada entrada;

    @Column(nullable = false)
    private Integer status;

    @Column(name = "tipo_movimento", nullable = false, length = 20)
    private String tipoMovimento;

    @Column(name = "data_movimento", nullable = false)
    private LocalDateTime dataMovimento;

    public EntradaMovimento() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Entrada getEntrada() {
        return entrada;
    }

    public void setEntrada(Entrada entrada) {
        this.entrada = entrada;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getTipoMovimento() {
        return tipoMovimento;
    }

    public void setTipoMovimento(String tipoMovimento) {
        this.tipoMovimento = tipoMovimento;
    }

    public LocalDateTime getDataMovimento() {
        return dataMovimento;
    }

    public void setDataMovimento(LocalDateTime dataMovimento) {
        this.dataMovimento = dataMovimento;
    }
}