package com.material.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.material.model.OrigemSistema;

import jakarta.persistence.LockModeType;

@Repository
public interface OrigemSistemaRepository
        extends JpaRepository<OrigemSistema, Long> {
	
	 @Lock(LockModeType.PESSIMISTIC_WRITE)
	    @Query("SELECT o FROM OrigemSistema o WHERE o.id = :id")
	    Optional<OrigemSistema> findByIdWithLock(@Param("id") Long id);

    Optional<OrigemSistema>
        findByOrigemSistemaTrueAndUnidadeAtivaTrue();
}