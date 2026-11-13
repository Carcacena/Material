package com.material.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.material.model.OrigemSistema;
import com.material.repository.OrigemSistemaRepository;
import com.material.service.OrigemSistemaService;

@CrossOrigin("*") 
@RestController
@RequestMapping("/api/origemsistema")
public class OrigemSistemaController {
	
	@Autowired
	private OrigemSistemaRepository origemSistemaRepository; // Saneado: Removida a injeção duplicada que travava a compilação
	
	@Autowired
	private OrigemSistemaService origemSistemaService;

	@GetMapping
	public ResponseEntity<List<OrigemSistema>> listar() {
		return ResponseEntity.ok(origemSistemaRepository.findAll());
	}

	/**
	 * 🌟 NOVO ENDPOINT: O JavaScript do balcão de vendas chama esta rota para descobrir 
	 * instantaneamente se a UF física instalada é SP, PR ou outra, mudando a alíquota na hora.
	 */
	@GetMapping("/ativa")
	public ResponseEntity<OrigemSistema> obterOrigemAtiva() {
		return origemSistemaRepository.findAll().stream()
				.filter(os -> os.getOrigemSistema() != null && os.getOrigemSistema())
				.findFirst()
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}
	
	@PostMapping
	@Transactional
	public ResponseEntity<OrigemSistema> cadastrar(@RequestBody OrigemSistema origemsistema) {
		// ⚡ REGRA DE OURO: Se este cadastro for a origem física ativa, desmarca as outras
		if (origemsistema.getOrigemSistema() != null && origemsistema.getOrigemSistema()) {
			desmarcarOutrasOrigens(null);
		}
		
		return ResponseEntity.ok(origemSistemaRepository.save(origemsistema));
	}

	@PutMapping("/{id}")
	@Transactional
	public ResponseEntity<OrigemSistema> atualizar(
			@PathVariable Long id,
			@RequestBody OrigemSistema dadosNovos) {

		return origemSistemaRepository.findById(id)
				.map(origemsistema -> {

					// CPF/CNPJ NÃO ALTERA - permanece o que já está no banco para integridade fiscal

					origemsistema.setNome(dadosNovos.getNome());
					origemsistema.setInscricaoEstadual(dadosNovos.getInscricaoEstadual());
					origemsistema.setEmail(dadosNovos.getEmail());
					origemsistema.setTelefone(dadosNovos.getTelefone());
					origemsistema.setCep(dadosNovos.getCep());
					origemsistema.setUf(dadosNovos.getUf());
					origemsistema.setLogradouro(dadosNovos.getLogradouro());
					origemsistema.setNumero(dadosNovos.getNumero());
					origemsistema.setComplemento(dadosNovos.getComplemento());
					origemsistema.setBairro(dadosNovos.getBairro());
					origemsistema.setCidade(dadosNovos.getCidade());
					origemsistema.setUnidadeAtiva(dadosNovos.getUnidadeAtiva());
					
					// 🌟 A LINHA CORRIGIDA: Agora encaixada de forma única e limpa no fluxo
					origemsistema.setNotafiscal(dadosNovos.getNotafiscal());
					// 🌟 A LINHA CORRIGIDA: Agora encaixada de forma única e limpa no fluxo
					origemsistema.setSerie(dadosNovos.getSerie());
				
					// ⚡ ATUALIZAÇÃO DA ORIGEM: Atualiza o status vindo da tela
					origemsistema.setOrigemSistema(dadosNovos.getOrigemSistema());

					// ⚡ REGRA DE OURO: Se foi alterado para ser a origem ativa, limpa os outros
					if (origemsistema.getOrigemSistema() != null && origemsistema.getOrigemSistema()) {
						desmarcarOutrasOrigens(id);
					}

					OrigemSistema atualizado = origemSistemaRepository.save(origemsistema);
					return ResponseEntity.ok(atualizado);
				})
				.orElse(ResponseEntity.notFound().build());
	}
	/**
	 * 🖨️ RELATÓRIOS: Adiciona o cabeçalho corporativo da empresa mestre nos documentos PDF
	 */
	public void adicionarCabecalhoOrigem(
			  Document document,
		        OrigemSistema origem,
		        com.lowagie.text.Font fontNormal) throws DocumentException {
	    PdfPTable tabelaOrigem = new PdfPTable(1);
	    tabelaOrigem.setWidthPercentage(100);
	    tabelaOrigem.setSpacingAfter(10f);

	    StringBuilder texto = new StringBuilder();

	    texto.append(origem.getNome()).append("\n");

	    texto.append("CNPJ: ")
	         .append(origem.getCnpj() != null ? origem.getCnpj() : "");

	    if (origem.getInscricaoEstadual() != null &&
	        !origem.getInscricaoEstadual().isBlank()) {

	        texto.append("   IE: ")
	             .append(origem.getInscricaoEstadual());
	    }

	    texto.append("\n");

	    texto.append(
	        origem.getLogradouro() != null
	            ? origem.getLogradouro()
	            : ""
	    );

	    if (origem.getNumero() != null) {
	        texto.append(", ").append(origem.getNumero());
	    }

	    if (origem.getBairro() != null) {
	        texto.append(" - ").append(origem.getBairro());
	    }

	    texto.append("\n");

	    if (origem.getCidade() != null) {
	        texto.append(origem.getCidade());
	    }

	    if (origem.getUf() != null) {
	        texto.append(" / ").append(origem.getUf());
	    }

	    if (origem.getCep() != null) {
	        texto.append("   CEP: ").append(origem.getCep());
	    }

	    texto.append("\n");

	    if (origem.getTelefone() != null) {
	        texto.append("Tel: ").append(origem.getTelefone());
	    }

	    if (origem.getEmail() != null) {
	        texto.append("   E-mail: ").append(origem.getEmail());
	    }

	    if (origem.getSerie() != null) {
	        texto.append("   Serie: ").append(origem.getSerie());
	    }
	    PdfPCell celula = new PdfPCell(
	        new Phrase(texto.toString(), fontNormal)
	    );

	    celula.setPadding(8f);
	    celula.setHorizontalAlignment(Element.ALIGN_CENTER);

	    tabelaOrigem.addCell(celula);

	    document.add(tabelaOrigem);
	}
	
	/**
	 * ⚡ MÉTODO AUXILIAR: Varre o banco de dados desmarcando qualquer outra linha 
	 * que estivesse configurada como origem ativa do sistema.
	 */
	private void desmarcarOutrasOrigens(Long idAtual) {
		List<OrigemSistema> listaCompleta = origemSistemaRepository.findAll();
		for (OrigemSistema os : listaCompleta) {
			// Se for cadastro novo (idAtual é null) ou se for um ID diferente do que estamos editando
			if (idAtual == null || !os.getId().equals(idAtual)) {
				if (os.getOrigemSistema() != null && os.getOrigemSistema()) {
					os.setOrigemSistema(false);
					origemSistemaRepository.save(os);
				}
			}
		}
	}
}	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	