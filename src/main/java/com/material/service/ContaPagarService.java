package com.material.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.material.dto.BaixaContaPagarDTO;
import com.material.dto.ContaPagarDTO;
import com.material.dto.GerarContasPagarDTO;
import com.material.dto.ParcelaContaPagarDTO;
import com.material.model.ContaPagar;
import com.material.model.Fornecedor;
import com.material.repository.ContaPagarRepository;
import com.material.repository.FornecedorRepository;

import jakarta.transaction.Transactional;

@Service
public class ContaPagarService {

    private final ContaPagarRepository repository;
    private final FornecedorRepository fornecedorRepository;

    public ContaPagarService(
            ContaPagarRepository repository,
            FornecedorRepository fornecedorRepository) {

        this.repository = repository;
        this.fornecedorRepository = fornecedorRepository;
    }

    @Transactional
    public List<ContaPagarDTO> listar() {

        return repository
            .findAllByOrderByDataVencimentoAsc()
            .stream()
            .map(this::converterDTO)
            .toList();
    }

    public List<ContaPagarDTO> porFornecedor(
            Long fornecedorId) {

        return repository
            .findByFornecedorIdOrderByDataVencimentoAsc(
                fornecedorId
            )
            .stream()
            .map(this::converterDTO)
            .toList();
    }

    public List<ContaPagarDTO> porNota(
            Integer numeroNotaFiscal,
            String serie) {

        return repository
            .findByNumeroNotaFiscalAndSerieOrderByNumeroParcelaAsc(
                numeroNotaFiscal,
                serie
            )
            .stream()
            .map(this::converterDTO)
            .toList();
    }

    @Transactional
    public List<ContaPagarDTO> gerarTitulos(
            GerarContasPagarDTO dto) {

        Fornecedor fornecedor =
            fornecedorRepository
                .findById(dto.getFornecedorId())
                .orElseThrow(
                    () -> new RuntimeException(
                        "Fornecedor não encontrado."
                    )
                );

        if (
            dto.getParcelas() == null ||
            dto.getParcelas().isEmpty()
        ) {
            throw new RuntimeException(
                "Nenhuma parcela foi informada."
            );
        }

        BigDecimal valorTotal =
            dto.getValorFinalCorrigido();

        int quantidadeParcelas =
            dto.getParcelas().size();

        BigDecimal valorPadrao =
            valorTotal.divide(
                BigDecimal.valueOf(
                    quantidadeParcelas
                ),
                2,
                RoundingMode.HALF_UP
            );

        BigDecimal acumulado =
            BigDecimal.ZERO;

        List<ContaPagarDTO> resultado =
            new ArrayList<>();

        for (
            int i = 0;
            i < quantidadeParcelas;
            i++
        ) {

            ParcelaContaPagarDTO parcela =
                dto.getParcelas().get(i);

            BigDecimal valorParcela;

            if (
                i ==
                quantidadeParcelas - 1
            ) {

                valorParcela =
                    valorTotal.subtract(
                        acumulado
                    );

            } else {

                valorParcela =
                    valorPadrao;

                acumulado =
                    acumulado.add(
                        valorParcela
                    );
            }

            if (
                parcela.getValor() != null
            ) {
                valorParcela =
                    parcela.getValor();
            }

            ContaPagar conta =
                new ContaPagar();

            conta.setNumeroEntrada(
                dto.getNumeroEntrada()
            );

            conta.setFornecedor(
                fornecedor
            );

            conta.setNumeroNotaFiscal(
                dto.getNumeroNotaFiscal()
            );

            conta.setSerie(
                dto.getSerie()
            );

            conta.setNumeroParcela(
                parcela.getNumeroParcela()
            );

            conta.setTotalParcelas(
                quantidadeParcelas
            );

            conta.setValorParcela(
                valorParcela
            );

            conta.setValorPago(
                BigDecimal.ZERO
            );

            conta.setInpcAnualAplicado(
                dto.getInpcAnualAplicado()
            );

            conta.setDataVencimento(
                parcela.getDataVencimento()
            );

            conta.setFormaPagamento(
                dto.getFormaPagamento()
            );

            conta.setStatus(1);

            ContaPagar salvo =
                repository.save(conta);

            resultado.add(
                converterDTO(salvo)
            );
        }

        return resultado;
    }

    @Transactional
    public ContaPagarDTO baixar(
            Long id,
            BaixaContaPagarDTO dto) {

        ContaPagar conta =
            repository
                .findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Título não encontrado."
                    )
                );

        if (
            Integer.valueOf(2)
                .equals(conta.getStatus())
        ) {
            throw new RuntimeException(
                "Título cancelado não pode receber baixa normal."
            );
        }

        BigDecimal valorBaixa =
            dto.getValorPago();

        if (
            valorBaixa == null ||
            valorBaixa.compareTo(
                BigDecimal.ZERO
            ) <= 0
        ) {
            throw new RuntimeException(
                "Valor de pagamento inválido."
            );
        }

        BigDecimal valorPagoAtual =
            conta.getValorPago() == null
                ? BigDecimal.ZERO
                : conta.getValorPago();

        BigDecimal novoValorPago =
            valorPagoAtual.add(
                valorBaixa
            );

        if (
            novoValorPago.compareTo(
                conta.getValorParcela()
            ) > 0
        ) {
            throw new RuntimeException(
                "Pagamento maior que o saldo do título."
            );
        }

        conta.setValorPago(
            novoValorPago
        );

        if (
            novoValorPago.compareTo(
                conta.getValorParcela()
            ) == 0
        ) {
            conta.setDataPagamento(
                LocalDateTime.now()
            );
        }

        return converterDTO(
            repository.save(conta)
        );
    }

    @Transactional
    public void cancelarPorEntrada(
            String numeroEntrada,
            String motivo) {

        List<ContaPagar> contas =
            repository.findByNumeroEntrada(
                numeroEntrada
            );

        for (ContaPagar conta : contas) {

            conta.setStatus(2);

            conta.setDataCancelamento(
                LocalDateTime.now()
            );

            conta.setMotivoCancelamento(
                motivo
            );

            repository.save(conta);
        }
    }

    private ContaPagarDTO converterDTO(
            ContaPagar conta) {

        ContaPagarDTO dto =
            new ContaPagarDTO();

        dto.setId(
            conta.getId()
        );

        dto.setNumeroEntrada(
            conta.getNumeroEntrada()
        );

        dto.setFornecedorId(
            conta.getFornecedor().getId()
        );

        dto.setFornecedorNome(
            conta.getFornecedor().getNome()
        );

        dto.setNumeroNotaFiscal(
            conta.getNumeroNotaFiscal()
        );

        dto.setSerie(
            conta.getSerie()
        );

        dto.setNumeroParcela(
            conta.getNumeroParcela()
        );

        dto.setTotalParcelas(
            conta.getTotalParcelas()
        );

        dto.setValorParcela(
            conta.getValorParcela()
        );

        BigDecimal valorPago =
            conta.getValorPago() == null
                ? BigDecimal.ZERO
                : conta.getValorPago();

        dto.setValorPago(
            valorPago
        );

        BigDecimal saldo =
            conta.getValorParcela()
                .subtract(valorPago);

        dto.setSaldo(
            saldo
        );

        dto.setDataVencimento(
            conta.getDataVencimento()
        );

        dto.setDataPagamento(
            conta.getDataPagamento()
        );

        dto.setDataLancamento(
            conta.getDataLancamento()
        );

        dto.setFormaPagamento(
            conta.getFormaPagamento()
        );

        dto.setStatus(
            conta.getStatus()
        );

        dto.setSituacao(
            calcularSituacao(conta)
        );

        return dto;
    }

    private String calcularSituacao(
            ContaPagar conta) {

        if (
            Integer.valueOf(2)
                .equals(conta.getStatus())
        ) {
            return "CANCELADO";
        }

        BigDecimal valorPago =
            conta.getValorPago() == null
                ? BigDecimal.ZERO
                : conta.getValorPago();

        if (
            valorPago.compareTo(
                conta.getValorParcela()
            ) >= 0
        ) {
            return "PAGO";
        }

        LocalDate hoje =
            LocalDate.now();

        LocalDate vencimento =
            conta.getDataVencimento();

        if (
            vencimento.isBefore(hoje)
        ) {
            return "VENCIDO";
        }

        long dias =
            ChronoUnit.DAYS.between(
                hoje,
                vencimento
            );

        if (dias <= 5) {
            return "VINCENDO";
        }

        return "A VENCER";
    }
}