package com.material.security;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

   @Bean
    CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();
        
    configuration.setAllowedOrigins(List.of(
            "http://localhost:8080",
                // 👈 Coloque a URL cirúrgica aqui!
            "https://material-construcao-production.up.railway.app/"
        ));
    
    configuration.setAllowedMethods(List.of(
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ));

    configuration.setAllowedHeaders(List.of(
        "Authorization",
        "Content-Type",
        "Cache-Control"
    ));

    configuration.setExposedHeaders(List.of(
        "Authorization"
    ));

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", configuration);

    return source;
}
      
   @Bean 
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception { 
       return http 
           .csrf(csrf -> csrf.disable()) 
           .cors(Customizer.withDefaults()) 
           .authorizeHttpRequests(auth -> auth
               // 🌟 1. Opções de CORS pré-flight e rotas base de autenticação
               .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
               .requestMatchers("/auth/**").permitAll() 
               .requestMatchers("/api/auth/**", "/public/**").permitAll() 
               
               // 🌟 2. Arquivos visuais e estáticos liberados para o navegador desenhar a tela 
               .requestMatchers( 
                   "/", 
                   "/*.html", 
                   "/*.js", 
                   "/*.css", 
                   "/*.png", 
                   "/*.jpg", 
                   "/*.mp3", 
                   "/mp3/**", 
                   "/favicon.ico", 
                   "/error", 
                   "/componentes-js/**"
               ).permitAll() 
               
               // 🌟 3. Rotas públicas do sistema e pastas de recursos estáticos (HTML/JS/CSS)
               .requestMatchers("/carrinho/public/pedido/**").permitAll() // Exceção do PDF público
               .requestMatchers(
                   "/menu/**", // Pasta com HTML e JS do menu integrados
                   "/Entradas/**", 
                   "/Fornecedores/**", 
                   "/Clientes/**", 
                   "/Produtos/**",
                   "/relatorios/**", 
                   "/vendas/**",
                   "/OrigemSistema/**",
                   "/css/**",
                   "/js/**"
                   // ⚠️ Se os seus controllers privados usam "/api/...", remova a linha abaixo:
                   // "/api/**" 
               ).permitAll()   

               // 🔒 4. Bloqueia as rotas específicas do sistema (Exige autenticação/Token JWT)
               .requestMatchers("/admin/**", "/usuario/**").authenticated() 
               .requestMatchers("/imprimeCarrinho/imprimeCarrinho/**").authenticated() 

               // 🔒 5. Bloqueia o que sobrou do carrinho e qualquer outra requisição da aplicação
               .requestMatchers("/carrinho", "/carrinho/**").authenticated() 
               .anyRequest().authenticated()
           ) 
           .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 
           .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) 
           .build(); 
   }
   

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
