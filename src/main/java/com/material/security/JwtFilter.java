package com.material.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 🌟 PASSE LIVRE: Ignora a validação do JWT para a rota de login e arquivos públicos
        if (path.startsWith("/auth/login") || path.startsWith("/api/auth/") || path.equals("/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // Recupera o token do cabeçalho
        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            token = authHeader.substring(7);
            System.out.println("TOKEN RECEBIDO = " + token);	
            try {

                username = jwtService.extrairUsername(token);

            } catch (Exception e) {

                e.printStackTrace();

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");

                response.getWriter().write(
                    "{\"error\":\"" + e.getMessage() + "\"}"
                );

                return;
            }
        }
            	
        // Valida e insere o usuário no contexto do Spring Security
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // 🌟 CORREÇÃO: Chamando o método correto em português do seu JwtService
            if (jwtService.validarToken(token, userDetails)) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);

                System.out.println("AUTENTICADO: " +
                        SecurityContextHolder.getContext().getAuthentication());
            }
        }

        filterChain.doFilter(request, response);
    }
}