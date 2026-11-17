package com.material.controller;

import com.material.model.ImagemIntroducao;
import com.material.model.ImagemProduto;
import com.material.repository.ImagemIntroducaoRepository;
import com.material.repository.ImagemProdutoRepository;
import com.material.repository.ProdutoRepository;
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

    private final String DIRETORIO_DESTINO =
            System.getenv("RAILWAY_VOLUME_MOUNT_PATH") != null
                    ? System.getenv("RAILWAY_VOLUME_MOUNT_PATH") + "/imagem_introducao/"
                    : "target/classes/static/imagem_introducao/";

    private final String DIRETORIO_PRODUTOS =
            System.getenv("RAILWAY_VOLUME_MOUNT_PATH") != null
                    ? System.getenv("RAILWAY_VOLUME_MOUNT_PATH") + "/imagem_produto/"
                    : "target/classes/static/imagem_produto/";

    private final ImagemIntroducaoRepository repository;
    private final ImagemProdutoRepository imagemProdutoRepository;
    private final ProdutoRepository produtoRepository;

    public MidiaController(
            ImagemIntroducaoRepository repository,
            ImagemProdutoRepository imagemProdutoRepository,
            ProdutoRepository produtoRepository) {
        this.repository = repository;
        this.imagemProdutoRepository = imagemProdutoRepository;
        this.produtoRepository = produtoRepository;
    }

    // 📤 Endpoint de Upload + Gravação no MySQL (Introdução)
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

    // 📋 Endpoint para listar as imagens cadastradas (Introdução)
    @GetMapping("/introducao")
    public ResponseEntity<List<ImagemIntroducao>> listarImagensIntroducao() {
        return ResponseEntity.ok(repository.findAllByOrderByDataCadastroDesc());
    }

    // 🗑️ Endpoint opcional para excluir imagem (Introdução)
    @DeleteMapping("/introducao/{id}")
    public ResponseEntity<?> excluirImagem(@PathVariable Long id) {
        return repository.findById(id).map(img -> {
            try {
                String base = System.getenv("RAILWAY_VOLUME_MOUNT_PATH") != null
                        ? System.getenv("RAILWAY_VOLUME_MOUNT_PATH")
                        : "target/classes/static";

                Path caminhoFisico = Paths.get(base + img.getCaminho());
                Files.deleteIfExists(caminhoFisico);
                repository.delete(img);

                return ResponseEntity.ok(Map.of("mensagem", "Imagem removida com sucesso!"));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("erro", "Erro ao apagar arquivo físico: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // =========================================================================
    // 📷 NOVOS ENDPOINTS: FOTO DO PRODUTO (VITRINE NO BALCÃO)
    // =========================================================================

    @PostMapping("/produto/{produtoId}")
    public ResponseEntity<?> uploadFotoProduto(
            @PathVariable Long produtoId,
            @RequestParam("arquivo") MultipartFile arquivo) {
        try {
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("erro", "Selecione uma imagem válida."));
            }

            var produtoOpt = produtoRepository.findById(produtoId);
            if (produtoOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("erro", "Produto não encontrado no banco."));
            }

            File dir = new File(DIRETORIO_PRODUTOS);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String nomeOriginal = arquivo.getOriginalFilename();
            String ext = (nomeOriginal != null && nomeOriginal.contains("."))
                    ? nomeOriginal.substring(nomeOriginal.lastIndexOf("."))
                    : ".jpg";
            String novoNome = "prod_" + produtoId + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;

            Files.write(Paths.get(DIRETORIO_PRODUTOS + novoNome), arquivo.getBytes());
            String urlRelativa = "/imagem_produto/" + novoNome;

            ImagemProduto img = imagemProdutoRepository.findByProdutoId(produtoId)
                    .orElse(new ImagemProduto());

            if (img.getCaminhoUrl() != null) {
                String base = System.getenv("RAILWAY_VOLUME_MOUNT_PATH") != null
                        ? System.getenv("RAILWAY_VOLUME_MOUNT_PATH")
                        : "target/classes/static";
                Files.deleteIfExists(Paths.get(base + img.getCaminhoUrl()));
            }

            img.setProduto(produtoOpt.get());
            img.setNomeArquivo(novoNome);
            img.setCaminhoUrl(urlRelativa);
            img.setDataCadastro(LocalDateTime.now());
            imagemProdutoRepository.save(img);

            return ResponseEntity.ok(Map.of(
                    "url", urlRelativa,
                    "mensagem", "Foto do produto salva com sucesso!"
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao gravar foto: " + e.getMessage()));
        }
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<?> buscarFotoProduto(@PathVariable Long produtoId) {
        return imagemProdutoRepository.findByProdutoId(produtoId)
                .map(img -> ResponseEntity.ok(Map.of("url", img.getCaminhoUrl())))
                .orElse(ResponseEntity.ok(Map.of("url", "")));
    }
}