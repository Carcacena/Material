package com.material.controller;

import com.material.model.Carrinho;
import com.material.service.CarrinhoService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/carrinho")
public class CarrinhoController {

  //  @Autowired
  //  private CarrinhoService carrinhoService;
    
    @Autowired
    private com.material.service.CarrinhoService carrinhoService;

    // 🌟 A INCLUSÃO CIRÚRGICA: Adiciona o serviço de impostos para sumir os erros vermelhos!
    @Autowired
    private com.material.service.CarrinhoImpostosService carrinhoImpostosService;

    // 💸 4. CONFIRMAR FATURAMENTO (POST) - Consolida a venda do pedido, vincula o cliente e retorna JSON estruturado
    @PostMapping("/faturar/pedido/{numeroPedido}/cliente/{clienteId}")
    public ResponseEntity<?> faturarCarrinho(@PathVariable String numeroPedido, @PathVariable Long clienteId) {
        try {
            // 1. Chama a regra de serviço original para faturar
            carrinhoService.faturarCarrinhoDoPedido(numeroPedido, clienteId);
            
            // 2. Busca os itens do lote atualizados pós-faturamento
            List<com.material.model.Carrinho> itens = carrinhoService.pesquisarTodosItensDoPedido(numeroPedido);
            
            com.material.dto.CarrinhoImpostosDTO respostaDTO = new com.material.dto.CarrinhoImpostosDTO();
            
            if (itens != null && !itens.isEmpty()) {
                com.material.model.Carrinho primeiroItem = itens.get(0);
                Long carrinhoId = primeiroItem.getId();
                
                // 🌟 ACUMULADOR SEGURO: Busca o número sequencial real gerado pelo motor do faturamento
                if (primeiroItem.getNumeroNotaFiscal() != null) {
                    respostaDTO.setNumeroNotaFiscal(Integer.valueOf(primeiroItem.getNumeroNotaFiscal().toString()));
                } else {
                    respostaDTO.setNumeroNotaFiscal(1); // Se for o primeiro da base limpa, inicia em 1
                }
                respostaDTO.setSerie(primeiroItem.getSerie() != null ? primeiroItem.getSerie() : "B1");

                try {
                    // Tenta complementar com as informações detalhadas da tabela de impostos
                    com.material.model.CarrinhoImpostos impostos = carrinhoImpostosService.buscarPorCarrinho(carrinhoId);
                    if (impostos != null) {
                        if (impostos.getNumeroNotaFiscal() != null) {
                            respostaDTO.setNumeroNotaFiscal(Integer.valueOf(impostos.getNumeroNotaFiscal().toString()));
                        }
                        if (impostos.getSerie() != null) {
                            respostaDTO.setSerie(impostos.getSerie().toString());
                        }
                        // 🌟 SINCRO DE ENCARGOS: Preenche os valores para o frontend não receber tudo null
                        respostaDTO.setValorTotalNota(impostos.getValorTotalNota());
                        respostaDTO.setValorTotalProdutos(impostos.getValorTotalProdutos());
                        respostaDTO.setValorIcms(impostos.getValorIcms());
                        respostaDTO.setBaseCalculoIcms(impostos.getBaseCalculoIcms());
                    }
                } catch (Exception e) {
                    System.out.println("ℹ️ Impostos sendo processados ou tabela vazia para o ID: " + carrinhoId);
                }
            } else {
                // Fallback absoluto caso o pedido suma por erro de transação
                respostaDTO.setNumeroNotaFiscal(1);
                respostaDTO.setSerie("B1");
            }
            
            // 3. Retorna o objeto DTO legítimo e dinâmico
            return ResponseEntity.ok(respostaDTO);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🔍 1. LISTAR ITENS EM STANDBY (GET) - Filtra os itens da tela da direita pelo número do pedido
    @GetMapping("/pedido/{numeroPedido}")
    public ResponseEntity<List<Carrinho>> listarItens(@PathVariable String numeroPedido) {
        return ResponseEntity.ok(carrinhoService.listarItensStandby(numeroPedido));
    }

    // 🟢 2. SALVAR ITEM NO STANDBY (POST) - Quando move o produto para a direita
    @PostMapping
    public ResponseEntity<Carrinho> adicionarItem(@RequestBody Carrinho carrinho) {
        return ResponseEntity.ok(carrinhoService.salvarItemNoCarrinho(carrinho));
    }

    // 🔴 3. LIMPAR CARRINHO INTEGRAL (DELETE) - Quando o operador aborta o cupom inteiro
    @DeleteMapping("/pedido/{numeroPedido}")
    public ResponseEntity<Void> limparCarrinho(@PathVariable String numeroPedido) {
        carrinhoService.limparCarrinhoDoPedido(numeroPedido);
        return ResponseEntity.noContent().build();
    }

    // 🎯 5. DELETAR UM UNICO ITEM DO CARRINHO (Botão X da Linha)
    @DeleteMapping("/item/{id}")
    public ResponseEntity<Void> excluirItemDoCarrinho(@PathVariable Long id) {
        try {
            carrinhoService.excluirItemPorId(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Erro ao deletar item do cupom: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 🔎 6. PESQUISAR PEDIDOS POR PERÍODO (GET)
    @GetMapping("/pesquisa/periodo")
    public ResponseEntity<List<Carrinho>> pesquisarPorPeriodo(
            @RequestParam LocalDate dataInicio,
            @RequestParam LocalDate dataFim
    ) {
        return ResponseEntity.ok(
                carrinhoService.pesquisarPedidosPorPeriodo(dataInicio, dataFim)
        );
    }

    // 🔎 7. PESQUISAR TODOS OS ITENS DE UM PEDIDO ESPECÍFICO (GET)
    @GetMapping("/pesquisa/pedido/{numeroPedido}")
    public ResponseEntity<List<Carrinho>> pesquisarPedidoCompleto(
            @PathVariable String numeroPedido
    ) {
        return ResponseEntity.ok(
                carrinhoService.pesquisarTodosItensDoPedido(numeroPedido)
        );
    }

    // 🖨️ 8. EMISSÃO GERENCIAL DO TICKET EM PDF (ROTA PÚBLICA INTEGRADA)
    @GetMapping("/public/pedido/{numeroPedido}/pdf")
    public ResponseEntity<byte[]> gerarRelatorioPdf(@PathVariable String numeroPedido) {
        try {
            List<Carrinho> itens = carrinhoService.pesquisarTodosItensDoPedido(numeroPedido);

            if (itens == null || itens.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font fonteTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font fonteNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("SISTEMA MAGIA - BALCÃO DE VENDAS", fonteTitulo));
            document.add(new Paragraph("Relatório de Conta Corrente do Pedido: " + numeroPedido, fonteNormal));
            document.add(new Paragraph("----------------------------------------------------------------------------------"));

            double totalGeral = 0;
            int indice = 1;

            for (Carrinho item : itens) {
                double preco = item.getPrecoPraticado() != null ? item.getPrecoPraticado().doubleValue() : 0.0;
                double qtd = item.getQuantidade() != null ? item.getQuantidade().doubleValue() : 0.0;
                double sub = qtd * preco;
                totalGeral += sub;

                String nomeProd = "Desconhecido";
                String idProdTxt = "0";

                if (item.getProduto() != null) {
                    idProdTxt = String.valueOf(item.getProduto().getId());
                    if (item.getProduto().getNome() != null) {
                        nomeProd = item.getProduto().getNome();
                    }
                }

                if (nomeProd.equals("Desconhecido") && !idProdTxt.equals("0")) {
                    nomeProd = "Produto ID: " + idProdTxt;
                }

                String linha = String.format("%d - %s  |  Qtd: %.3f  |  Preço: R$ %.2f  |  Subtotal: R$ %.2f",
                        indice++, nomeProd, qtd, preco, sub);
                document.add(new Paragraph(linha, fonteNormal));
            }

            document.add(new Paragraph("----------------------------------------------------------------------------------"));
            document.add(new Paragraph(String.format("VALOR TOTAL DO LOTE NO BANCO: R$ %.2f", totalGeral), fonteTitulo));

            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline().filename("pedido-" + numeroPedido + ".pdf").build());

            return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/devolver/item/{itemId}")
    public ResponseEntity<String> devolverItem(@PathVariable Long itemId) {
        try {
            carrinhoService.devolverItem(itemId);
            return ResponseEntity.ok("Item devolvido com sucesso, piá!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🔄 10. DEVOLVER VÁRIOS ITENS DE UMA VEZ (PUT)
    @PutMapping("/devolver/lote")
    public ResponseEntity<String> devolverItens(@RequestBody List<Long> itemIds) {
        try {
            carrinhoService.devolverItens(itemIds);
            return ResponseEntity.ok("Itens devolvidos com sucesso, piá!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    
    
    
    
    
}
