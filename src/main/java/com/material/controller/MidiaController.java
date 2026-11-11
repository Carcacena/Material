package com.material.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/midia")
@CrossOrigin(origins = "*")
public class MidiaController {

    // Caminho da pasta física estática dentro do projeto Material
    private final String DIRETORIO_DESTINO = "src/main/resources/static/menu/imagens/";

    @PostMapping("/upload")
    public ResponseEntity<?> fazerUpload(@RequestParam("arquivo") MultipartFile arquivo) {
        try {
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("erro", "O arquivo enviado está vazio."));
            }

            // Garante que a pasta static/imagens/produtos exista no disco
            File diretorio = new File(DIRETORIO_DESTINO);
            if (!diretorio.exists()) {
                diretorio.mkdirs();
            }

            // Pega a extensão original do arquivo (.png, .jpg, .webp)
            String nomeOriginal = arquivo.getOriginalFilename();
            String extensao = "";
            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
            }

            // Gera um nome único por UUID para evitar sobrescrever outra foto
            String novoNome = UUID.randomUUID().toString() + extensao;

            // Salva fisicamente o arquivo na pasta
            Path caminhoCompleto = Paths.get(DIRETORIO_DESTINO + novoNome);
            Files.write(caminhoCompleto, arquivo.getBytes());

            // URL relativa de retorno para exibir na tela ou salvar no MySQL
            String urlRelativa = "/imagens/produtos/" + novoNome;

            return ResponseEntity.ok(Map.of(
                "url", urlRelativa,
                "mensagem", "Upload físico realizado com sucesso!"
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Falha de gravação: " + e.getMessage()));
        }
    }
}