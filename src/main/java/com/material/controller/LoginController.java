package com.material.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.material.dto.LoginDTO;
import com.material.service.BlacklistService;
import com.material.model.Usuario;
import com.material.repository.UsuarioRepository;
import com.material.security.JwtService;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LoginController {

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final BlacklistService blacklistService;

    // Injeção de dependência por construtor (Boa prática recomendada pelo Spring)
    public LoginController(UsuarioRepository usuarioRepository, 
                           PasswordEncoder encoder, 
                           JwtService jwtService, 
                           BlacklistService blacklistService) {
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.blacklistService = blacklistService;
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.trim().isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cabeçalho Authorization ausente ou vazio.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        // Remove o prefixo Bearer caso ele exista
        String tokenLimpo = token.startsWith("Bearer ") ? token.substring(7).trim() : token.trim();
        
        blacklistService.add(tokenLimpo);
        logger.info("Logout realizado. Token adicionado à blacklist.");

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout realizado com sucesso");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginDTO login) {
        logger.info("===== INICIANDO FLUXO DE LOGIN =====");
        logger.info("Tentativa de login para o usuário: {}", login.getLogin());

        Usuario user = usuarioRepository.findByLogin(login.getLogin());

        if (user == null) {
            logger.warn("Usuário '{}' não foi encontrado no banco de dados.", login.getLogin());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Usuário não encontrado"));
        }

        logger.debug("Usuário encontrado. Validando credenciais...");
        
        boolean senhaOk = encoder.matches(login.getSenha(), user.getSenha());
        logger.info("A senha informada confere com o banco? {}", senhaOk);

        if (!senhaOk) {
            logger.warn("Senha inválida informada para o usuário '{}'.", login.getLogin());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Senha inválida"));
        }

        String perfilSeguro = user.getPerfil() != null ? user.getPerfil().toUpperCase() : "USER";
        String token = jwtService.gerarToken(user.getLogin(), perfilSeguro);

        logger.info("Login bem-sucedido! Token JWT gerado para o usuário '{}'.", login.getLogin());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("usuarioId", user.getId()); 
        response.put("login", user.getLogin());
        response.put("perfil", perfilSeguro);

        return ResponseEntity.ok(response);
    }
}