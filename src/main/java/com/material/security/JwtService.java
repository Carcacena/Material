package com.material.security;

import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:3600000}")
    private long expiration;

    // CORREÇÃO CRÍTICA: Decodifica de forma estável independente do S.O. (Local ou Railway)
    // Substitua o método antigo por este:
    private javax.crypto.SecretKey getSigningKey() {
        // Fallback seguro caso o Spring ainda não tenha carregado o properties na tela da IDE
        String chaveHex = (this.secret != null && !this.secret.isEmpty()) ? this.secret : "7f5c2b3a1e4d8f9c0b2a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a";
        System.out.println("CHAVE JWT = " + chaveHex);
        // SOLUÇÃO DEFINITIVA: Usa a classe nativa do Java (Java 17/21+) para converter a chave Hexadecimal
        byte[] keyBytes = java.util.HexFormat.of().parseHex(chaveHex);
        
        // Converte os bytes puros para a SecretKey exigida pelo JJWT
        return io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
    }

    public String gerarToken(UserDetails userDetails) {
        return buildToken(userDetails.getUsername());
    }

    public String gerarToken(String login, String perfil) {
        return buildToken(login);
    }

    private String buildToken(String subject) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey()) // O JJWT define o algoritmo HS256 automaticamente pelo tamanho da chave
                .compact();
    }

    public String extrairUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey()) // Sintaxe oficial JJWT 0.12+
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validarToken(String token, UserDetails userDetails) {
        String username = extrairUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpirado(token);
    }

    private boolean isTokenExpirado(String token) {
        Date exp = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        return exp.before(new Date());
    }
}