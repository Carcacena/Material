package com.material.repository;

import com.material.model.ImagemIntroducao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImagemIntroducaoRepository extends JpaRepository<ImagemIntroducao, Long> {
    List<ImagemIntroducao> findAllByOrderByDataCadastroDesc();
}