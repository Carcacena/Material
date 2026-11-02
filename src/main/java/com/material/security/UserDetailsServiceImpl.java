package com.material.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.material.model.Usuario;
import com.material.repository.UsuarioRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Usuario usuario = usuarioRepository.findByLogin(username);
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuário não encontrado: " + username);
        }

        // 🔐 Usa login e senha da entidade
        // Roles podem vir do campo perfil ou do tipo
        String role = "ROLE_USER";
        if ("ADMIN".equalsIgnoreCase(usuario.getPerfil())) {
            role = "ROLE_ADMIN";
        } else if (usuario.getTipo() == 0) {
            role = "ROLE_SUPERADMIN";
        }

        return new User(
                usuario.getLogin(),
                usuario.getSenha(), // senha já criptografada com BCrypt
                List.of(new SimpleGrantedAuthority(role))
        );
    }
}