package com.material.repository;

import com.material.model.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

    List<Carrinho> findByNumeroPedidoAndStatus(String numeroPedido, Integer status);

    List<Carrinho> findByDataCriacaoBetweenOrderByDataCriacaoDesc(
        LocalDateTime inicio, LocalDateTime fim
    );

    List<Carrinho> findByNumeroPedidoOrderByIdAsc(String numeroPedido);

    void deleteByNumeroPedido(String numeroPedido);

    // ====================================================================
    // 🔥 A SOLUÇÃO COMPLETA: Força o carregamento do Produto e Cliente
    // ====================================================================
    @Query("SELECT c FROM Carrinho c " +
           "JOIN FETCH c.produto " +
           "JOIN FETCH c.cliente " +
           "WHERE c.numeroPedido = :numeroPedido " +
           "ORDER BY c.id ASC")
    List<Carrinho> buscarPedidoComRelacionamentos(@Param("numeroPedido") String numeroPedido);
}