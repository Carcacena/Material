package com.material.repository;

import com.material.model.LogSistema;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LogSistemaRepository extends JpaRepository<LogSistema, Long> {

    List<LogSistema> findAllByOrderByDataHoraDesc();
}