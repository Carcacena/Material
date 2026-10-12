package com.material.controller;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.material.model.Produto;
import com.material.model.Entrada;
import com.material.model.EntradaImpostos;
import com.material.model.EntradaProdutos;
import com.material.model.OrigemSistema;
import com.material.repository.ProdutoRepository;
import com.material.repository.EntradaRepository;
import com.material.repository.OrigemSistemaRepository;
import com.material.repository.CarrinhoImpostosRepository;
import com.material.repository.EntradaImpostosRepository;
import com.material.repository.EntradaProdutosRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.awt.Color;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
	
	@Autowired
	private CarrinhoImpostosRepository carrinhoImpostosRepository;

	@Autowired
    private com.material.repository.CarrinhoRepository carrinhoRepository;
	
	@Autowired
	private ProdutoRepository produtoRepository;

	@Autowired
	private EntradaRepository entradaRepository;

	@Autowired
	private EntradaImpostosRepository impostosRepository;

	@Autowired
	private EntradaProdutosRepository entradaProdutosRepository;

	@Autowired
	private OrigemSistemaRepository origemSistemaRepository;

	// ==========================================================
	// 🌳 ENDPOINT 1: MAPA DE INVENTÁRIO DE MERCADORIAS (MIM)
	@GetMapping("/mim")
	public ResponseEntity<byte[]> gerarMim() {
		OrigemSistema origem = origemSistemaRepository.findByOrigemSistemaTrueAndUnidadeAtivaTrue()
				.orElseThrow(() -> new RuntimeException("Nenhuma origem ativa configurada."));

		List<Produto> produtos = produtoRepository.findAll();

		try {
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			Document document = new Document(PageSize.A4, 20, 20, 20, 20);
			PdfWriter.getInstance(document, out);

			document.open();

			// Fontes globais declaradas corretamente
			Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, Color.DARK_GRAY);

			Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
			Font fontCorpo = FontFactory.getFont(
			        FontFactory.HELVETICA,
			        9,
			        Color.DARK_GRAY
			);
	
			// 🏢 CABEÇALHO DA ORIGEM ATIVA

			adicionarCabecalhoOrigem(
					document, origem, fontCorpo);
			

			// 🎯 MUDANÇA AQUI: Tabela Invisível de 1 coluna para travar o alinhamento em
			// 100%
		
			PdfPTable table = new PdfPTable(new float[] { 10f, 40f, 15f, 15f, 20f });
			table.setWidthPercentage(100);

			String[] headers = { "ID", "PRODUTO", "SALDO ESTOQUE", "PREÇO CUSTO", "VALOR TOTAL" };

			for (int i = 0; i < headers.length; i++) {
				PdfPCell cell = new PdfPCell(new Phrase(headers[i], fontHeader));
				cell.setBackgroundColor(new Color(46, 125, 50));
				cell.setPadding(8);
				cell.setBorder(PdfPCell.NO_BORDER);
				if (i >= 2)
					cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				else
					cell.setHorizontalAlignment(Element.ALIGN_LEFT);
				table.addCell(cell);
			}
			BigDecimal valorPatrimonialTotal = BigDecimal.ZERO;
			Color borderCol = new Color(229, 231, 235);

			for (Produto p : produtos) {
				PdfPCell cId = new PdfPCell(new Phrase(String.valueOf(p.getId()), fontCorpo));
				configurarBordaFina(cId, Element.ALIGN_LEFT, borderCol);
				table.addCell(cId);

				PdfPCell cNome = new PdfPCell(new Phrase(p.getNome(), fontCorpo));
				configurarBordaFina(cNome, Element.ALIGN_LEFT, borderCol);
				table.addCell(cNome);

				BigDecimal qtde = p.getAGranel() ? p.getEstoque() : BigDecimal.valueOf(p.getEstoqueAtual());
				PdfPCell cQtde = new PdfPCell(new Phrase(qtde.toString(), fontCorpo));
				configurarBordaFina(cQtde, Element.ALIGN_RIGHT, borderCol);
				table.addCell(cQtde);

				BigDecimal custo = p.getPrecoCusto() != null ? p.getPrecoCusto() : BigDecimal.ZERO;
				PdfPCell cCusto = new PdfPCell(new Phrase("R$ " + String.format("%.2f", custo), fontCorpo));
				configurarBordaFina(cCusto, Element.ALIGN_RIGHT, borderCol);
				table.addCell(cCusto);

				BigDecimal totalItem = qtde.multiply(custo);
				valorPatrimonialTotal = valorPatrimonialTotal.add(totalItem);

				PdfPCell cTotal = new PdfPCell(new Phrase("R$ " + String.format("%.2f", totalItem), fontCorpo));
				configurarBordaFina(cTotal, Element.ALIGN_RIGHT, borderCol);
				table.addCell(cTotal);
			}

			document.add(table);

			Font fontTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(198, 40, 40));
			Paragraph totalGeral = new Paragraph(
					"\n💰 VALOR PATRIMONIAL TOTAL EM ESTOQUE: R$ " + String.format("%.2f", valorPatrimonialTotal),
					fontTotal);
			totalGeral.setAlignment(Element.ALIGN_RIGHT);
			document.add(totalGeral);

			document.close();

			HttpHeaders headersHttp = new HttpHeaders();
			headersHttp.setContentType(MediaType.APPLICATION_PDF);
			headersHttp.setContentDispositionFormData("filename", "Mapa_Inventario_Mercadorias.pdf");

			return new ResponseEntity<>(out.toByteArray(), headersHttp, HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// ==========================================================
	// 📈 ENDPOINT 2: MAPA GERENCIAL DE COMPRAS (MGC)
	// ==========================================================
	@GetMapping("/mgc")
	public ResponseEntity<byte[]> gerarMgc() {
		OrigemSistema origem = origemSistemaRepository.findByOrigemSistemaTrueAndUnidadeAtivaTrue()
				.orElseThrow(() -> new RuntimeException("Nenhuma origem ativa configurada."));

		List<Produto> produtos = produtoRepository.findAll();

		try {
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			Document document = new Document(PageSize.A4, 20, 20, 20, 20);
			PdfWriter.getInstance(document, out);

			document.open();

			Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.DARK_GRAY);
			Paragraph titulo = new Paragraph("📈 MGC - MAPA GERENCIAL DE COMPRAS (MARGENS DE LUCRO)", fontTitulo);
			titulo.setAlignment(Element.ALIGN_CENTER);
			titulo.setSpacingAfter(20);
			document.add(titulo);

			PdfPTable table = new PdfPTable(new float[] { 25f, 25f, 12f, 13f, 13f, 12f });
			table.setWidthPercentage(100);

			Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
			String[] headers = { "PRODUTO", "FORNECEDOR", "P. CUSTO", "P. VENDA", "LUCRO (R$)", "MARGEM %" };
			
		
			Font fontCorpo = FontFactory.getFont(
			        FontFactory.HELVETICA,
			        9,
			        Color.DARK_GRAY
			);
			
			
			adicionarCabecalhoOrigem(
			        document,
			        origem,
			        fontCorpo
			);
			
			
				
			for (int i = 0; i < headers.length; i++) {
				PdfPCell cell = new PdfPCell(new Phrase(headers[i], fontHeader));
				cell.setBackgroundColor(new Color(2, 136, 209)); // Azul Gerencial
				cell.setPadding(8);
				cell.setBorder(PdfPCell.NO_BORDER);

				if (i >= 2 && i <= 4)
					cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
				else if (i == 5)
					cell.setHorizontalAlignment(Element.ALIGN_CENTER);
				else
					cell.setHorizontalAlignment(Element.ALIGN_LEFT);

				table.addCell(cell);
			}

			//Font fontCorpo1 = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
			Color borderCol = new Color(229, 231, 235);
			Color cinzaZebra = new Color(249, 250, 251);

			boolean alternarCor = false;

			for (Produto p : produtos) {
				// 🎨 Efeito Zebrado: Escolhe a cor do fundo dinamicamente
				Color corFundoLinha = alternarCor ? cinzaZebra : Color.WHITE;
				alternarCor = !alternarCor;

				// Nome do Produto
				PdfPCell cNome = new PdfPCell(new Phrase(p.getNome(), fontCorpo));
				configurarBordaFina(cNome, Element.ALIGN_LEFT, corFundoLinha, borderCol);
				table.addCell(cNome);

				// Fornecedor Vinculado
				String nomeForn = (p.getFornecedor() != null) ? p.getFornecedor().getNome() : "Não Informado";
				PdfPCell cForn = new PdfPCell(new Phrase(nomeForn, fontCorpo));
				configurarBordaFina(cForn, Element.ALIGN_LEFT, corFundoLinha, borderCol);
				table.addCell(cForn);

				// Valores Financeiros Básicos
				BigDecimal custo = (p.getPrecoCusto() != null) ? p.getPrecoCusto() : BigDecimal.ZERO;
				BigDecimal venda = (p.getPrecoVenda() != null) ? p.getPrecoVenda() : BigDecimal.ZERO;

				PdfPCell cCusto = new PdfPCell(new Phrase("R$ " + String.format("%.2f", custo), fontCorpo));
				configurarBordaFina(cCusto, Element.ALIGN_RIGHT, corFundoLinha, borderCol);
				table.addCell(cCusto);

				PdfPCell cVenda = new PdfPCell(new Phrase("R$ " + String.format("%.2f", venda), fontCorpo));
				configurarBordaFina(cVenda, Element.ALIGN_RIGHT, corFundoLinha, borderCol);
				table.addCell(cVenda);

				// Cálculo do Lucro em Reais
				BigDecimal lucroReais = venda.subtract(custo);
				PdfPCell cLucro = new PdfPCell(new Phrase("R$ " + String.format("%.2f", lucroReais), fontCorpo));
				configurarBordaFina(cLucro, Element.ALIGN_RIGHT, corFundoLinha, borderCol);
				table.addCell(cLucro);

				// Cálculo da Margem Percentual (Com tratamento contra divisão por zero)
				String margemPercentual = "0.00%";
				if (custo.compareTo(BigDecimal.ZERO) > 0) {
					BigDecimal margem = lucroReais.divide(custo, 4, RoundingMode.HALF_UP)
							.multiply(BigDecimal.valueOf(100));
					margemPercentual = margem.setScale(2, RoundingMode.HALF_UP).toString() + "%";
				}

				PdfPCell cellMargem = new PdfPCell(new Phrase(margemPercentual, fontCorpo));
				configurarBordaFina(cellMargem, Element.ALIGN_CENTER, corFundoLinha, borderCol);
				table.addCell(cellMargem);
			}

			document.add(table);
			document.close();

			HttpHeaders headersHttp = new HttpHeaders();
			headersHttp.setContentType(MediaType.APPLICATION_PDF);
			headersHttp.setContentDispositionFormData("filename", "Mapa_Gerencial_Compras.pdf");

			return new ResponseEntity<>(out.toByteArray(), headersHttp, HttpStatus.OK);

		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// ==========================================================
	// 🖨️ ENDPOINT 3: DANFE CONSOLIDADA DE ENTRADA
	// ==========================================================
	@GetMapping("/danfe/{id}")
	public ResponseEntity<byte[]> gerarDanfeConsolidada(@PathVariable Long id) {
		try {
			// Busca os registros amarrados pelo ID no MySQL
			Entrada entrada = entradaRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("Nota Fiscal não encontrada"));

			EntradaImpostos impostos = impostosRepository.findByEntrada_Id(id).orElse(new EntradaImpostos());

			List<EntradaProdutos> produtos = entradaProdutosRepository.findByEntradaId(id);

			// Coleta os dados dinâmicos da empresa ativa na tabela origem_sistema
			OrigemSistema matriz = origemSistemaRepository.findAll().stream()
					.filter(o -> o.getOrigemSistema() != null && o.getOrigemSistema()).findFirst()
					.orElse(new OrigemSistema());

			Document document = new Document(PageSize.A4, 20, 20, 20, 20);
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			PdfWriter.getInstance(document, baos);

			document.open();

			Font fontSubtitulos = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
			Font fontDadosNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
			Font fontDadosNegrito = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);

			// 1. Bloco de Cabeçalho: Matriz + Detalhes da DANFE
			PdfPTable tabelaCabecalho = new PdfPTable(2);
			tabelaCabecalho.setWidthPercentage(100);
			tabelaCabecalho.setWidths(new float[] { 60f, 40f });
			tabelaCabecalho.setSpacingAfter(15f);

			StringBuilder txtEmpresa = new StringBuilder();
			txtEmpresa.append(
					matriz.getNome() != null ? matriz.getNome().toUpperCase() : "SISTEMA HÍBRIDO MATERIAL CONSTRUÇÃO")
					.append("\n");
			txtEmpresa.append("CNPJ: ").append(matriz.getCnpj() != null ? matriz.getCnpj() : "26.461.699/0001-23")
					.append("\n");
			txtEmpresa.append("Endereço: ")
					.append(matriz.getLogradouro() != null ? matriz.getLogradouro() : "Rua Quirino dos Santos, 430")
					.append("\n");
			txtEmpresa.append("Cidade: ").append(matriz.getCidade() != null ? matriz.getCidade() : "Curitiba")
					.append(" / ").append(matriz.getUf() != null ? matriz.getUf() : "PR").append("\n");
			txtEmpresa.append("E-mail: ")
					.append(matriz.getEmail() != null ? matriz.getEmail() : "josegouveadepaula@gmail.com");

			PdfPCell celEmpresa = new PdfPCell(new Phrase(txtEmpresa.toString(), fontDadosNormal));
			celEmpresa.setPadding(10f);
			celEmpresa.setBorderColor(new Color(209, 213, 219));
			celEmpresa.setBorderWidth(0.5f);
			tabelaCabecalho.addCell(celEmpresa);

			StringBuilder txtDanfe = new StringBuilder();
			txtDanfe.append("DANFE CONSOLIDADA\n");
			txtDanfe.append("Doc. Auxiliar de Entrada\n\n");
			txtDanfe.append("Nº NOTA: ").append(entrada.getNumeroNota()).append("\n");
			txtDanfe.append("SÉRIE: ").append(entrada.getSerie() != null ? entrada.getSerie() : "001").append("\n");
			txtDanfe.append("RECEBIMENTO: ").append(entrada.getDataRecebimento());

			PdfPCell celDanfe = new PdfPCell(new Phrase(txtDanfe.toString(), fontDadosNegrito));
			celDanfe.setPadding(10f);
			celDanfe.setHorizontalAlignment(Element.ALIGN_RIGHT);
			celDanfe.setBorderColor(new Color(209, 213, 219));
			celDanfe.setBorderWidth(0.5f);
			tabelaCabecalho.addCell(celDanfe);
			document.add(tabelaCabecalho);

			// 2. Quadro da Chave de Acesso
			PdfPTable tabelaChave = new PdfPTable(1);
			tabelaChave.setWidthPercentage(100);
			tabelaChave.setSpacingAfter(15f);

			PdfPCell celChaveTitulo = new PdfPCell(
					new Phrase("CHAVE DE ACESSO REGISTRADA (44 DÍGITOS)", fontSubtitulos));
			celChaveTitulo.setBackgroundColor(new Color(46, 125, 50));
			celChaveTitulo.setPadding(4f);
			celChaveTitulo.setBorder(PdfPCell.NO_BORDER);
			tabelaChave.addCell(celChaveTitulo);

			String chave = entrada.getChaveAcesso() != null ? entrada.getChaveAcesso() : "Não Informada";
			PdfPCell celChaveValor = new PdfPCell(
					new Phrase(chave, FontFactory.getFont(FontFactory.COURIER, 11, Color.DARK_GRAY)));
			celChaveValor.setPadding(8f);
			celChaveValor.setBorderColor(new Color(226, 232, 240));
			celChaveValor.setBorderWidth(0.5f);
			celChaveValor.setBackgroundColor(new Color(248, 250, 252));
			tabelaChave.addCell(celChaveValor);

			// 3. Quadro de Impostos e Totais (Tabela entrada_impostos)
			PdfPTable tabelaImpostos = new PdfPTable(6);
			tabelaImpostos.setWidthPercentage(100);
			tabelaImpostos.setSpacingAfter(15f);

			String[] titulosImpostos = { "BASE ICMS", "VALOR ICMS", "VLR FRETE", "VLR SEGURO", "DESCONTO",
					"TOTAL NOTA" };
			String[] valoresImpostos = {
					"R$ " + (impostos.getBaseCalculoIcms() != null
							? String.format("%.2f", impostos.getBaseCalculoIcms())
							: "0,00"),
					"R$ " + (impostos.getValorIcms() != null ? String.format("%.2f", impostos.getValorIcms()) : "0,00"),
					"R$ " + (impostos.getValorFrete() != null ? String.format("%.2f", impostos.getValorFrete())
							: "0,00"),
					"R$ " + (impostos.getValorSeguro() != null ? String.format("%.2f", impostos.getValorSeguro())
							: "0,00"),
					"R$ " + (impostos.getValorDesconto() != null ? String.format("%.2f", impostos.getValorDesconto())
							: "0,00"),
					"R$ " + (impostos.getValorTotalNota() != null ? String.format("%.2f", impostos.getValorTotalNota())
							: "0,00") };

			for (int i = 0; i < 6; i++) {
				String contCel = titulosImpostos[i] + "\n" + valoresImpostos[i];
				PdfPCell celImposto = new PdfPCell(new Phrase(contCel, fontDadosNegrito));
				celImposto.setPadding(8f);
				celImposto.setHorizontalAlignment(Element.ALIGN_RIGHT);
				celImposto.setBorderWidth(0.5f);

				if (i == 5) { // Destaque Verde suave para o Valor Total da Nota
					celImposto.setBackgroundColor(new Color(240, 253, 244));
					celImposto.setBorderColor(new Color(187, 247, 208));
				} else {
					celImposto.setBackgroundColor(new Color(248, 250, 252));
					celImposto.setBorderColor(new Color(226, 232, 240));
				}
				tabelaImpostos.addCell(celImposto);
			}
			document.add(tabelaImpostos);

			// 4. Grid de Materiais Lançados (Tabela entrada_produtos)
			PdfPTable tabelaProdutos = new PdfPTable(new float[] { 15f, 45f, 20f, 20f });
			tabelaProdutos.setWidthPercentage(100);

			String[] colunasGrid = { "ID PROD", "DESCRIÇÃO DO ITEM", "QTD ENTRADA", "PREÇO CUSTO" };
			for (int i = 0; i < 4; i++) {
				PdfPCell th = new PdfPCell(new Phrase(colunasGrid[i], fontSubtitulos));
				th.setBackgroundColor(new Color(46, 125, 50)); // Verde do cabeçalho
				th.setPadding(8f);
				th.setBorder(PdfPCell.NO_BORDER);
				if (i >= 2)
					th.setHorizontalAlignment(Element.ALIGN_RIGHT);
				tabelaProdutos.addCell(th);
			}

			boolean alternarCor = false;
			Color cinzaZebra = new Color(249, 250, 251);
			Color cinzaBordaLinha = new Color(229, 231, 235);

			for (EntradaProdutos prod : produtos) {
				Color corFundoLinha = alternarCor ? cinzaZebra : Color.WHITE;
				alternarCor = !alternarCor;

				// ID do Produto
				PdfPCell cId = new PdfPCell(
						new Phrase(String.valueOf(prod.getProduto() != null ? prod.getProduto().getId() : "S/I"),
								fontDadosNormal));
				configurarBordaFinaBase(cId, Element.ALIGN_LEFT, corFundoLinha, cinzaBordaLinha);
				tabelaProdutos.addCell(cId);

				// Descrição puxando o nome real da Entidade Produto
				String nomeProd = (prod.getProduto() != null && prod.getProduto().getNome() != null)
						? prod.getProduto().getNome()
						: "Produto Código: " + prod.getId();
				PdfPCell cDesc = new PdfPCell(new Phrase(nomeProd, fontDadosNormal));
				configurarBordaFinaBase(cDesc, Element.ALIGN_LEFT, corFundoLinha, cinzaBordaLinha);
				tabelaProdutos.addCell(cDesc);

				// Quantidade
				PdfPCell cQtd = new PdfPCell(new Phrase(String.valueOf(prod.getQuantidade()), fontDadosNormal));
				configurarBordaFinaBase(cQtd, Element.ALIGN_RIGHT, corFundoLinha, cinzaBordaLinha);
				tabelaProdutos.addCell(cQtd);

				// Preço de Custo formatado
				String precoFormatado = "R$ "
						+ (prod.getPrecoCusto() != null ? String.format("%.2f", prod.getPrecoCusto()) : "0,00");
				PdfPCell cPreco = new PdfPCell(new Phrase(precoFormatado, fontDadosNormal));
				configurarBordaFinaBase(cPreco, Element.ALIGN_RIGHT, corFundoLinha, cinzaBordaLinha);
				tabelaProdutos.addCell(cPreco);
			}

			document.add(tabelaProdutos);
			document.close();

			// Envia o array de bytes binários brutos do PDF para o utils.js ler na web
			byte[] pdfBytes = baos.toByteArray();
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_PDF);
			headers.setContentDispositionFormData("inline", "DANFE_Consolidada_" + id + ".pdf");

			return ResponseEntity.ok().headers(headers).body(pdfBytes);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	// ==========================================================
	// 🛠️ ASSINATURAS UNIFICADAS DE DESIGN (SOBRECARGA DE MÉTODOS)
	// ==========================================================

	// 1️⃣ Versão Simples (Usada no /mim): Sem fundo alternado
	private void configurarBordaFina(PdfPCell celula, int alinhamento, Color borda) {
		celula.setPadding(6f);
		celula.setHorizontalAlignment(alinhamento);
		celula.setBorder(PdfPCell.BOTTOM);
		celula.setBorderColor(borda);
		celula.setBorderWidth(0.5f);
	}

	// 2️⃣ Versão Zebrada (Usada no /mgc): Aceita a cor do fundo dinamicamente!
	private void configurarBordaFina(PdfPCell celula, int alinhamento, Color fundo, Color borda) {
		celula.setPadding(6f);
		celula.setHorizontalAlignment(alinhamento);
		celula.setBackgroundColor(fundo); // Pinta a linha alternada (Zebra)
		celula.setBorder(PdfPCell.BOTTOM);
		celula.setBorderColor(borda);
		celula.setBorderWidth(0.5f);
	}

	// 3️⃣ Mantém a versão antiga caso a DANFE original ainda faça uso dela
	private void configurarBordaFinaBase(PdfPCell celula, int alinhamento, Color fundo, Color borda) {
		celula.setPadding(8f);
		celula.setHorizontalAlignment(alinhamento);
		celula.setBackgroundColor(fundo);
		celula.setBorder(PdfPCell.BOTTOM);
		celula.setBorderColor(borda);
		celula.setBorderWidth(0.5f);
	}

	// ==========================================================
	// 🔍 ENDPOINT: BUSCA NOTAS POR PERÍODO PARA O DROPDOWN
	// ==========================================================
	@GetMapping("/entradas/periodo")
	public ResponseEntity<List<com.material.dto.EntradaPeriodoDTO>> buscarEntradasPorPeriodo(
			@org.springframework.web.bind.annotation.RequestParam("inicio") String inicioStr,
			@org.springframework.web.bind.annotation.RequestParam("fim") String fimStr) {
		try {
			// Converte as Strings de data que vêm do HTML para LocalDate
			java.time.LocalDate inicio = java.time.LocalDate.parse(inicioStr);
			java.time.LocalDate fim = java.time.LocalDate.parse(fimStr);

			// Executa aquela query JPQL que você tem no EntradaRepository
			List<com.material.dto.EntradaPeriodoDTO> resultados = entradaRepository.buscarEntradasPorPeriodo(inicio,
					fim);

			return ResponseEntity.ok(resultados);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	private void configurarCelulaGrade(PdfPCell celula, int alinhamento, Color borda) {
		celula.setPadding(6f);
		celula.setHorizontalAlignment(alinhamento);
		celula.setBorder(PdfPCell.BOTTOM); // Linha discreta apenas abaixo do registro
		celula.setBorderColor(borda);
		celula.setBorderWidth(0.5f);
	}

	private void configurarCelulaZebrada(PdfPCell celula, int alinhamento, Color fundo, Color borda) {
		celula.setPadding(6f);
		celula.setHorizontalAlignment(alinhamento);
		celula.setBackgroundColor(fundo); // Aplica a cor alternada da linha
		celula.setBorder(PdfPCell.BOTTOM);
		celula.setBorderColor(borda);
		celula.setBorderWidth(0.5f);
	}

	private void adicionarCabecalhoOrigem(Document document, OrigemSistema origem, Font fontNormal)
			throws DocumentException {

		PdfPTable tabelaOrigem = new PdfPTable(1);
		tabelaOrigem.setWidthPercentage(100);
		tabelaOrigem.setSpacingAfter(10f);

		StringBuilder texto = new StringBuilder();

		texto.append(origem.getNome()).append("\n");

		texto.append("CNPJ: ").append(origem.getCnpj() != null ? origem.getCnpj() : "");

		if (origem.getInscricaoEstadual() != null && !origem.getInscricaoEstadual().isBlank()) {

			texto.append("   IE: ").append(origem.getInscricaoEstadual());
		}

		texto.append("\n");

		if (origem.getLogradouro() != null)
			texto.append(origem.getLogradouro());

		if (origem.getNumero() != null)
			texto.append(", ").append(origem.getNumero());

		if (origem.getBairro() != null)
			texto.append(" - ").append(origem.getBairro());

		texto.append("\n");

		if (origem.getCidade() != null)
			texto.append(origem.getCidade());

		if (origem.getUf() != null)
			texto.append(" / ").append(origem.getUf());

		if (origem.getCep() != null)
			texto.append("   CEP: ").append(origem.getCep());

		texto.append("\n");

		if (origem.getTelefone() != null)
			texto.append("Tel: ").append(origem.getTelefone());

		if (origem.getEmail() != null)
			texto.append("   E-mail: ").append(origem.getEmail());

		PdfPCell celula = new PdfPCell(new Phrase(texto.toString(), fontNormal));

		celula.setPadding(8f);
		celula.setHorizontalAlignment(Element.ALIGN_CENTER);

		tabelaOrigem.addCell(celula);
		document.add(tabelaOrigem);
	}

	// ==========================================================
    // 🖨️ ENDPOINT CENTRALIZADO: DANFE DE SAÍDA (PEDIDO DO CAIXA)
    // ==========================================================
	  @GetMapping("/danfe-saida/{numeroPedido}")
	    public ResponseEntity<byte[]> gerarDanfeSaida(@PathVariable String numeroPedido) {
	         try {
	             // 🎯 AJUSTE DE CONTINGÊNCIA: Se o dropdown mandar "6", tentamos buscar o registro exato
	             List<com.material.model.Carrinho> itens = null;
	             
	             try {
	                 // Força a conversão do texto "6" para o número 6 puro se o seu repositório buscar por ID ou se o número do pedido for interpretado como Long no banco
	                 itens = carrinhoRepository.buscarPedidoComRelacionamentos(numeroPedido);
	             } catch (Exception e) {
	                 System.out.println("Busca direta falhou, tentando tratamento alternativo...");
	             }

	             // Se a busca literal não trouxer nada, aciona o plano B tentando ler como ID numérico puro
	             if (itens == null || itens.isEmpty()) {
	                 try {
	                     Long idLong = Long.parseLong(numeroPedido.trim());
	                     // Caso o seu repository aceite apenas o número convertido, passamos a String limpa do número
	                     itens = carrinhoRepository.buscarPedidoComRelacionamentos(String.valueOf(idLong));
	                 } catch (NumberFormatException nfe) {
	                     System.out.println("Falha ao converter String para número.");
	                 }
	             }

	             // Se mesmo com o tratamento o banco não achar o lote do carrinho, retorna erro de não encontrado
	             if (itens == null || itens.isEmpty()) {
	                 return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	             }

	            ByteArrayOutputStream out = new ByteArrayOutputStream();
	            // Folha A4 com margens profissionais de 20 pontos
	            Document document = new Document(PageSize.A4, 20, 20, 20, 20);
	            PdfWriter.getInstance(document, out);
	            document.open();

	            // Tipografia moderna e limpa
	            Font fontSubtitulos = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
	            Font fontDadosNormal = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
	            Font fontDadosNegrito = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);

	            Color cinzaBordaElemento = new Color(209, 213, 219);
	         // ==========================================================
	         // 🧾 DADOS PRINCIPAIS DA DANFE DE SAÍDA
	         // ==========================================================

	         com.material.model.Carrinho primeiroItem = itens.get(0);

	         com.material.model.Cliente cliente =
	                 primeiroItem.getCliente();

	         com.material.model.OrigemSistema origem =
	                 origemSistemaRepository
	                         .findByOrigemSistemaTrueAndUnidadeAtivaTrue()
	                         .orElse(null);

			 com.material.model.CarrinhoImpostos impostos =
	                 carrinhoImpostosRepository
	                         .findByCarrinho_Id(primeiroItem.getId())
	                         .orElse(null);

	         Integer numeroNotaFiscal =
	                 primeiroItem.getNumeroNotaFiscal();

	         String serieNota =
	                 primeiroItem.getSerie();


	         // ==========================================================
	         // 🏢 EMITENTE + IDENTIFICAÇÃO DA DANFE
	         // ==========================================================

	         PdfPTable tabelaCabecalho =
	                 new PdfPTable(new float[]{65f, 35f});

	         tabelaCabecalho.setWidthPercentage(100);
	         tabelaCabecalho.setSpacingAfter(8f);


	         // ---------- EMITENTE ----------

	         StringBuilder emitente = new StringBuilder();

	         if (origem != null) {

	             emitente
	                 .append(origem.getNome() != null
	                         ? origem.getNome()
	                         : "MATERIAL CONSTRUÇÃO")
	                 .append("\n");

	             emitente
	                 .append("CPF/CNPJ: ")
	                 .append(origem.getCnpj() != null
	                         ? origem.getCnpj()
	                         : "");

	             if (origem.getInscricaoEstadual() != null &&
	                 !origem.getInscricaoEstadual().isBlank()) {

	                 emitente
	                     .append("    IE: ")
	                     .append(origem.getInscricaoEstadual());
	             }

	             emitente.append("\n");

	             emitente
	                 .append("Endereço: ")
	                 .append(origem.getLogradouro() != null
	                         ? origem.getLogradouro()
	                         : "")
	                 .append(", ")
	                 .append(origem.getNumero() != null
	                         ? origem.getNumero()
	                         : "");

	             emitente.append("\n");

	             emitente
	                 .append(origem.getBairro() != null
	                         ? origem.getBairro()
	                         : "")
	                 .append("    CEP: ")
	                 .append(origem.getCep() != null
	                         ? origem.getCep()
	                         : "");

	             emitente.append("\n");

	             emitente
	                 .append(origem.getCidade() != null
	                         ? origem.getCidade()
	                         : "")
	                 .append(" / ")
	                 .append(origem.getUf() != null
	                         ? origem.getUf()
	                         : "");

	             if (origem.getTelefone() != null &&
	                 !origem.getTelefone().isBlank()) {

	                 emitente
	                     .append("    Fone: ")
	                     .append(origem.getTelefone());
	             }

	             if (origem.getEmail() != null &&
	                 !origem.getEmail().isBlank()) {

	                 emitente
	                     .append("\nE-mail: ")
	                     .append(origem.getEmail());
	             }

	         } else {

	             emitente.append("Origem do sistema não localizada.");
	         }


	         PdfPCell celEmitente =
	                 new PdfPCell(
	                     new Phrase(
	                         emitente.toString(),
	                         fontDadosNormal
	                     )
	                 );

	         celEmitente.setPadding(8f);
	         celEmitente.setBorderColor(cinzaBordaElemento);
	         celEmitente.setBorderWidth(0.5f);


	         // ---------- DANFE ----------

	         String textoDanfe =
	                 "DANFE CONSOLIDADA\n" +
	                 "Documento Auxiliar - SAÍDA\n\n" +
	                 "NF: " +
	                 (numeroNotaFiscal != null
	                     ? numeroNotaFiscal
	                     : "") +
	                 "\nSÉRIE: " +
	                 (serieNota != null
	                     ? serieNota
	                     : "") +
	                 "\nPEDIDO: " +
	                 numeroPedido;


	         PdfPCell celDanfe =
	                 new PdfPCell(
	                     new Phrase(
	                         textoDanfe,
	                         fontDadosNegrito
	                     )
	                 );

	         celDanfe.setPadding(8f);
	         celDanfe.setHorizontalAlignment(
	                 Element.ALIGN_CENTER
	         );

	         celDanfe.setVerticalAlignment(
	                 Element.ALIGN_MIDDLE
	         );

	         celDanfe.setBorderColor(
	                 cinzaBordaElemento
	         );

	         celDanfe.setBorderWidth(0.5f);


	         tabelaCabecalho.addCell(celEmitente);
	         tabelaCabecalho.addCell(celDanfe);

	         document.add(tabelaCabecalho);


	         // ==========================================================
	         // 👤 DESTINATÁRIO
	         // ==========================================================

	         if (cliente != null) {

	             StringBuilder destino =
	                     new StringBuilder();

	             destino
	                 .append("DESTINATÁRIO / REMETENTE\n")
	                 .append(
	                     cliente.getNome() != null
	                         ? cliente.getNome()
	                         : ""
	                 )
	                 .append("\n");

	             destino
	                 .append("CPF/CNPJ: ")
	                 .append(
	                     cliente.getCnpj() != null
	                         ? cliente.getCnpj()
	                         : ""
	                 );

	             if (cliente.getInscricaoEstadual() != null &&
	                 !cliente.getInscricaoEstadual().isBlank()) {

	                 destino
	                     .append("    IE: ")
	                     .append(
	                         cliente.getInscricaoEstadual()
	                     );
	             }

	             destino.append("\n");

	             destino
	                 .append("Endereço: ")
	                 .append(
	                     cliente.getLogradouro() != null
	                         ? cliente.getLogradouro()
	                         : ""
	                 )
	                 .append(", ")
	                 .append(
	                     cliente.getNumero() != null
	                         ? cliente.getNumero()
	                         : ""
	                 );

	             if (cliente.getComplemento() != null &&
	                 !cliente.getComplemento().isBlank()) {

	                 destino
	                     .append(" - ")
	                     .append(cliente.getComplemento());
	             }

	             destino.append("\n");

	             destino
	                 .append("Bairro: ")
	                 .append(
	                     cliente.getBairro() != null
	                         ? cliente.getBairro()
	                         : ""
	                 )
	                 .append("    CEP: ")
	                 .append(
	                     cliente.getCep() != null
	                         ? cliente.getCep()
	                         : ""
	                 );

	             destino.append("\n");

	             destino
	                 .append(
	                     cliente.getCidade() != null
	                         ? cliente.getCidade()
	                         : ""
	                 )
	                 .append(" / ")
	                 .append(
	                     cliente.getUf() != null
	                         ? cliente.getUf()
	                         : ""
	                 );

	             if (cliente.getTelefone() != null &&
	                 !cliente.getTelefone().isBlank()) {

	                 destino
	                     .append("    Fone: ")
	                     .append(cliente.getTelefone());
	             }

	             PdfPTable tabelaDestinatario =
	                     new PdfPTable(1);

	             tabelaDestinatario.setWidthPercentage(100);
	             tabelaDestinatario.setSpacingAfter(8f);

	             PdfPCell celDestino =
	                     new PdfPCell(
	                         new Phrase(
	                             destino.toString(),
	                             fontDadosNormal
	                         )
	                     );

	             celDestino.setPadding(8f);
	             celDestino.setBorderColor(
	                     cinzaBordaElemento
	             );

	             tabelaDestinatario.addCell(celDestino);

	             document.add(tabelaDestinatario);
	         }
	            
	            
	            

	            // Título Superior blindado em Tabela Invisível para perfeito alinhamento
	            PdfPTable tabelaTitulo = new PdfPTable(1);
	            tabelaTitulo.setWidthPercentage(100);
	            tabelaTitulo.setSpacingAfter(15f);
	            PdfPCell celulaTitulo = new PdfPCell(new Phrase("DANFE CONSOLIDADA - PEDIDO DE SAÍDA", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY)));
	            celulaTitulo.setHorizontalAlignment(Element.ALIGN_CENTER);
	            celulaTitulo.setBorder(PdfPCell.NO_BORDER);
	            tabelaTitulo.addCell(celulaTitulo);
	            document.add(tabelaTitulo);

	            // Grade de Produtos de Saída Proporcional de 5 colunas
	            PdfPTable tabelaProdutos = new PdfPTable(new float[]{10f, 50f, 12f, 13f, 15f});
	            tabelaProdutos.setWidthPercentage(100);

	            String[] colunasGrid = {"ITEM", "DESCRIÇÃO DO MATERIAL", "QTD", "PREÇO", "SUBTOTAL"};
	            for (int i = 0; i < colunasGrid.length; i++) {
	                PdfPCell th = new PdfPCell(new Phrase(colunasGrid[i], fontSubtitulos));
	                th.setBackgroundColor(new Color(2, 136, 209)); // Azul Gerencial que está no seu painel
	                th.setPadding(8f);
	                th.setBorder(PdfPCell.NO_BORDER);
	                if (i >= 2) th.setHorizontalAlignment(Element.ALIGN_RIGHT);
	                tabelaProdutos.addCell(th);
	            }

	            double totalGeral = 0;
	            int indice = 1;
	            boolean alternarLinha = false;
	            Color cinzaZebra = new Color(249, 250, 251);
	            Color cinzaBordaGrid = new Color(229, 231, 235);

	            for (com.material.model.Carrinho item : itens) {
	                Color corFundo = alternarLinha ? cinzaZebra : Color.WHITE;
	                alternarLinha = !alternarLinha;

	                double preco = item.getPrecoPraticado() != null ? item.getPrecoPraticado().doubleValue() : 0.0;
	                double qtd = item.getQuantidade() != null ? item.getQuantidade().doubleValue() : 0.0;
	                double sub = qtd * preco;
	                totalGeral += sub;

	                String nomeProd = item.getProduto() != null ? item.getProduto().getNome() : "Produto ID: " + item.getProduto().getId();

	                // 1. Índice
	                PdfPCell cInd = new PdfPCell(new Phrase(String.valueOf(indice++), fontDadosNormal));
	                configurarBordaFina(cInd, Element.ALIGN_LEFT, corFundo, cinzaBordaGrid);
	                tabelaProdutos.addCell(cInd);

	                // 2. Descrição
	                PdfPCell cDesc = new PdfPCell(new Phrase(nomeProd, fontDadosNormal));
	                configurarBordaFina(cDesc, Element.ALIGN_LEFT, corFundo, cinzaBordaGrid);
	                tabelaProdutos.addCell(cDesc);

	                // 3. Quantidade
	                PdfPCell cQtd = new PdfPCell(new Phrase(String.format("%.3f", qtd), fontDadosNormal));
	                configurarBordaFina(cQtd, Element.ALIGN_RIGHT, corFundo, cinzaBordaGrid);
	                tabelaProdutos.addCell(cQtd);

	                // 4. Preço
	                PdfPCell cPreco = new PdfPCell(new Phrase("R$ " + String.format("%.2f", preco), fontDadosNormal));
	                configurarBordaFina(cPreco, Element.ALIGN_RIGHT, corFundo, cinzaBordaGrid);
	                tabelaProdutos.addCell(cPreco);

	                // 5. Subtotal
	                PdfPCell cSub = new PdfPCell(new Phrase("R$ " + String.format("%.2f", sub), fontDadosNormal));
	                configurarBordaFina(cSub, Element.ALIGN_RIGHT, corFundo, cinzaBordaGrid);
	                tabelaProdutos.addCell(cSub);
	            }
	            document.add(tabelaProdutos);

	            // Bloco de Fechamento com fundo verde sutil premium
	            PdfPTable tabelaFechamento = new PdfPTable(1);
	            tabelaFechamento.setWidthPercentage(100);
	            tabelaFechamento.setSpacingBefore(15f);

	            String txtTotal = "VALOR TOTAL DO PEDIDO NO BANCO: R$ " + String.format("%.2f", totalGeral);
	            PdfPCell celTotalGeral = new PdfPCell(new Phrase(txtTotal, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(22, 101, 52))));
	            celTotalGeral.setPadding(10f);
	            celTotalGeral.setHorizontalAlignment(Element.ALIGN_RIGHT);
	            celTotalGeral.setBackgroundColor(new Color(240, 253, 244)); 
	            celTotalGeral.setBorderColor(new Color(187, 247, 208));    
	            celTotalGeral.setBorderWidth(0.5f);
	            tabelaFechamento.addCell(celTotalGeral);
	            document.add(tabelaFechamento);

	            document.close();

	            byte[] pdfBytes = out.toByteArray();
	            HttpHeaders headers = new HttpHeaders();
	            headers.setContentType(MediaType.APPLICATION_PDF);
	            headers.setContentDispositionFormData("inline", "DANFE_Saida_" + numeroPedido + ".pdf");

	            return ResponseEntity.ok().headers(headers).body(pdfBytes);

	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	        }
	    }
	
    // ==========================================================
    // 🛒 ENDPOINT AJUSTADO: BUSCA PEDIDOS REAIS VIA CARRINHO
    // ==========================================================
    // ==========================================================
    // 🛒 ENDPOINT SEGURO: BUSCA PEDIDOS REAIS VIA CARRINHO
    // ==========================================================
    @GetMapping("/vendas/periodo")
    public ResponseEntity<List<com.material.dto.EntradaPeriodoDTO>> buscarVendasPorPeriodo(
            @org.springframework.web.bind.annotation.RequestParam("inicio") String inicioStr,
            @org.springframework.web.bind.annotation.RequestParam("fim") String fimStr) {
        try {
            // Converte e injeta os horários cheios para o LocalDateTime do seu banco
            java.time.LocalDateTime inicio = java.time.LocalDate.parse(inicioStr).atStartOfDay();
            java.time.LocalDateTime fim = java.time.LocalDate.parse(fimStr).atTime(23, 59, 59);

            // 🎯 CONSULTA DIRETA: Puxa do banco usando o método que já existe no seu CarrinhoRepository!
            List<com.material.model.Carrinho> movimentacoes = carrinhoRepository
                .findByDataCriacaoBetweenOrderByDataCriacaoDesc(inicio, fim);

            // Transforma a lista nativa no DTO esperado pelo JavaScript da tela
            List<com.material.dto.EntradaPeriodoDTO> resultados = movimentacoes.stream()
                .map(c -> {
                    String numPedido = c.getNumeroPedido() != null ? c.getNumeroPedido() : "S/P";
                    String nomeCliente = (c.getCliente() != null) ? c.getCliente().getNome() : "Consumidor Final";
                    
                    // Garante o cálculo do valor total do item
                    java.math.BigDecimal valorTotal = c.getPrecoPraticado() != null ? 
                        c.getPrecoPraticado().multiply(c.getQuantidade() != null ? c.getQuantidade() : java.math.BigDecimal.ONE) : 
                        java.math.BigDecimal.ZERO;

                    // Mapeia: ID, Número, Data, Cliente, Total
                    return new com.material.dto.EntradaPeriodoDTO(
                        c.getId(), 
                        numPedido, 
                        c.getDataCriacao().toLocalDate(), // Transforma para LocalDate limpo
                        nomeCliente, 
                        valorTotal
                    );
                })
                .toList();

            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
	
	
	
	
	
	
	
	
	
}
