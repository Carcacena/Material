package com.material.controller;

import com.material.model.ImagemIntroducao;
import com.material.repository.ImagemIntroducaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/midia")
@CrossOrigin(origins = "*")
public class MidiaController {

    //private final String DIRETORIO_DESTINO = "src/main/resources/static/imagem_introducao/";
   
	//private final String DIRETORIO_DESTINO =
	//        "target/classes/static/imagem_introducao/";
	
	private final String DIRETORIO_DESTINO =
	        System.getenv("RAILWAY_VOLUME_MOUNT_PATH") != null
	                ? System.getenv("RAILWAY_VOLUME_MOUNT_PATH") + "/imagem_introducao/"
	                : "target/classes/static/imagem_introducao/";
	private final ImagemIntroducaoRepository repository;

    public MidiaController(ImagemIntroducaoRepository repository) {
        this.repository = repository;
    }

    // 📤 Endpoint de Upload + Gravação no MySQL
    @PostMapping("/upload")
    public ResponseEntity<?> fazerUpload(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "titulo", required = false) String titulo) {
        try {
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("erro", "O arquivo enviado está vazio."));
            }

            File diretorio = new File(DIRETORIO_DESTINO);
            if (!diretorio.exists()) {
                diretorio.mkdirs();
            }

            String nomeOriginal = arquivo.getOriginalFilename();
            String extensao = "";
            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
            }

            String novoNome = UUID.randomUUID().toString() + extensao;
            Path caminhoCompleto = Paths.get(DIRETORIO_DESTINO + novoNome);
            Files.write(caminhoCompleto, arquivo.getBytes());

            String urlRelativa = "/imagem_introducao/" + novoNome;

            // 💾 Grava o registro na tabela imagem_introducao
            ImagemIntroducao registro = new ImagemIntroducao();
            registro.setTitulo((titulo != null && !titulo.trim().isEmpty()) ? titulo.trim() : nomeOriginal);
            registro.setNomeArquivo(novoNome);
            registro.setCaminho(urlRelativa);
            registro.setDataCadastro(LocalDateTime.now());

            ImagemIntroducao salvo = repository.save(registro);

            return ResponseEntity.ok(Map.of(
                "id", salvo.getId(),
                "titulo", salvo.getTitulo(),
                "url", salvo.getCaminho(),
                "mensagem", "Imagem salva e registrada no banco com sucesso!"
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Falha de gravação: " + e.getMessage()));
        }
    }

    // 📋 Endpoint para listar as imagens cadastradas (usado no painel e na introdução)
    @GetMapping("/introducao")
    public ResponseEntity<List<ImagemIntroducao>> listarImagensIntroducao() {
        return ResponseEntity.ok(repository.findAllByOrderByDataCadastroDesc());
    }

 // 🗑️ Endpoint opcional para excluir imagem do banco e da pasta
    @DeleteMapping("/introducao/{id}")
    public ResponseEntity<?> excluirImagem(@PathVariable Long id) {

        return repository.findById(id).map(img -> {

            try {

                String base =
                        System.getenv("RAILWAY_VOLUME_MOUNT_PATH") != null
                                ? System.getenv("RAILWAY_VOLUME_MOUNT_PATH")
                                : "target/classes/static";

                Path caminhoFisico =
                        Paths.get(base + img.getCaminho());

                Files.deleteIfExists(caminhoFisico);

                repository.delete(img);

                return ResponseEntity.ok(
                        Map.of("mensagem", "Imagem removida com sucesso!")
                );

            } catch (IOException e) {

                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "erro",
                                "Erro ao apagar arquivo físico: " + e.getMessage()
                        ));
            }

        }).orElse(ResponseEntity.notFound().build());
    }
}