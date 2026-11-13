package com.material.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.material.dto.BaixaContaReceberDTO;
import com.material.dto.ContaReceberDTO;
import com.material.dto.GerarContasReceberDTO;
import com.material.dto.ParcelaContaReceberDTO;
import com.material.model.Cliente;
import com.material.model.ContaReceber;
import com.material.repository.ClienteRepository;
import com.material.repository.ContaReceberRepository;

import jakarta.transaction.Transactional;
@Service
public class ContaReceberService {
	
	
	  private final ContaReceberRepository repository;
	    private final ClienteRepository clienteRepository;

	    public ContaReceberService(
	            ContaReceberRepository repository,
	            ClienteRepository clienteRepository) {

	        this.repository = repository;
	        this.clienteRepository = clienteRepository;
	    }

	    public List<ContaReceberDTO> listar() {

	        return repository
	            .findAllByOrderByDataVencimentoAsc()
	            .stream()
	            .map(this::converterDTO)
	            .toList();
	    }

	    public List<ContaReceberDTO> porCliente(Long clienteId) {

	        return repository
	            .findByClienteIdOrderByDataVencimentoAsc(clienteId)
	            .stream()
	            .map(this::converterDTO)
	            .toList();
	    }

	    public List<ContaReceberDTO> porNota(
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
	    public List<ContaReceberDTO> gerarTitulos(
	            GerarContasReceberDTO dto) {

	        Cliente cliente = clienteRepository
	            .findById(dto.getClienteId())
	            .orElseThrow(
	                () -> new RuntimeException("Cliente não encontrado.")
	            );

	        if (dto.getParcelas() == null ||
	            dto.getParcelas().isEmpty()) {

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
	                BigDecimal.valueOf(quantidadeParcelas),
	                2,
	                RoundingMode.HALF_UP
	            );

	        BigDecimal acumulado =
	            BigDecimal.ZERO;

	        List<ContaReceberDTO> resultado =
	            new ArrayList<>();

	        for (int i = 0; i < quantidadeParcelas; i++) {

	            ParcelaContaReceberDTO parcela =
	                dto.getParcelas().get(i);

	            BigDecimal valorParcela;

	            /*
	             * Última parcela absorve eventual
	             * diferença de centavos.
	             */
	            if (i == quantidadeParcelas - 1) {

	                valorParcela =
	                    valorTotal.subtract(acumulado);

	            } else {

	                valorParcela = valorPadrao;
	                acumulado =
	                    acumulado.add(valorParcela);
	            }

	            /*
	             * Se futuramente o front mandar
	             * valor individual negociado,
	             * ele prevalece.
	             */
	            if (parcela.getValor() != null) {
	                valorParcela = parcela.getValor();
	            }

	            ContaReceber conta =
	                new ContaReceber();

	            conta.setNumeroPedido(
	                dto.getNumeroPedido()
	            );

	            conta.setCliente(cliente);

	            conta.setNumeroNotaFiscal(
	                dto.getNumeroNotaFiscal()
	            );

	            conta.setSerie(dto.getSerie());

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

	            conta.setCartaoBandeira(
	                dto.getCartaoBandeira()
	            );

	            conta.setCartaoFinal(
	                dto.getCartaoFinal()
	            );

	            conta.setCartaoAutorizacao(
	                dto.getCartaoAutorizacao()
	            );

	            conta.setCartaoNsu(
	                dto.getCartaoNsu()
	            );

	            conta.setChavePix(
	                dto.getChavePix()
	            );

	            conta.setStatus(1);

	            /*
	             * Dinheiro, PIX e débito:
	             * registramos no histórico,
	             * mas já entram quitados.
	             */
	           

	            ContaReceber salvo =
	                repository.save(conta);

	            resultado.add(
	                converterDTO(salvo)
	            );
	        }

	        return resultado;
	    }

	    
	    
	    
	    @Transactional
	    public ContaReceberDTO baixar(
	            Long id,
	            BaixaContaReceberDTO dto) {

	        ContaReceber conta =
	            repository.findById(id)
	            .orElseThrow(
	                () -> new RuntimeException(
	                    "Título não encontrado."
	                )
	            );

	        if (conta.getStatus() == 2) {
	            throw new RuntimeException(
	                "Título devolvido não pode receber baixa normal."
	            );
	        }

	        BigDecimal valorBaixa =
	            dto.getValorPago();

	        if (
	            valorBaixa == null ||
	            valorBaixa.compareTo(BigDecimal.ZERO) <= 0
	        ) {
	            throw new RuntimeException(
	                "Valor de pagamento inválido."
	            );
	        }

	        BigDecimal novoValorPago =
	            conta.getValorPago()
	                .add(valorBaixa);

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
	    public void marcarDevolucaoPorPedido(
	            String numeroPedido,
	            String motivo) {

	        List<ContaReceber> contas =
	            repository.findByNumeroPedido(numeroPedido);

	        for (ContaReceber conta : contas) {

	            conta.setStatus(2);

	            conta.setDataDevolucao(
	                LocalDateTime.now()
	            );

	            conta.setMotivoDevolucao(
	                motivo
	            );

	            repository.save(conta);
	        }
	    }
	    
	    
	    
	    
	    
	    @Transactional
	    public void marcarDevolucao(
	            Integer nota,
	            String serie,
	            Long clienteId,
	            String motivo) {

	        List<ContaReceber> contas =
	            repository
	            .findByNumeroNotaFiscalAndSerieAndClienteIdOrderByNumeroParcelaAsc(
	                nota,
	                serie,
	                clienteId
	            );

	        for (ContaReceber conta : contas) {

	            conta.setStatus(2);
	            conta.setDataDevolucao(
	                LocalDateTime.now()
	            );
	            conta.setMotivoDevolucao(
	                motivo
	            );

	            repository.save(conta);
	        }
	    }

	    private ContaReceberDTO converterDTO(
	            ContaReceber conta) {

	        ContaReceberDTO dto =
	            new ContaReceberDTO();

	        dto.setId(conta.getId());

	        dto.setNumeroPedido(
	            conta.getNumeroPedido()
	        );

	        dto.setClienteId(
	            conta.getCliente().getId()
	        );

	        dto.setClienteNome(
	            conta.getCliente().getNome()
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

	        dto.setValorPago(
	            conta.getValorPago()
	        );

	        BigDecimal saldo =
	            conta.getValorParcela()
	            .subtract(
	                conta.getValorPago()
	            );

	        dto.setSaldo(saldo);

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
	            ContaReceber conta) {

	        if (conta.getStatus() == 2) {
	            return "DEVOLVIDO";
	        }

	        if (
	            conta.getValorPago()
	            .compareTo(
	                conta.getValorParcela()
	            ) >= 0
	        ) {
	            return "PAGO";
	        }

	        LocalDate hoje =
	            LocalDate.now();

	        LocalDate vencimento =
	            conta.getDataVencimento();

	        if (vencimento.isBefore(hoje)) {
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




