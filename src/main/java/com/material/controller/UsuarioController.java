package com.material.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.material.model.Usuario;
import com.material.repository.UsuarioRepository;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/usuario")


public class UsuarioController {
	@GetMapping("/teste")
	public String teste() {
	    return "ok";
	}
	
	@Autowired
	private PasswordEncoder encoder;
	
	@Autowired
    private UsuarioRepository usuarioRepository;

    // LISTAR
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // INCLUIR
    @PostMapping
    public Usuario incluirUsuario(@RequestBody Usuario usuario) {

        usuario.setSenha(
            encoder.encode(usuario.getSenha())
        );

        return usuarioRepository.save(usuario);
    }
   
    @PutMapping("/{id}")
    public Usuario alterar(
            @PathVariable Long id,
            @RequestBody Usuario usuario){

        Usuario u =
            usuarioRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException("Usuário não encontrado")
            );

        u.setLogin(usuario.getLogin());

        u.setSenha(
            encoder.encode(usuario.getSenha())
        );

        u.setPerfil(usuario.getPerfil());

        u.setTipo(usuario.getTipo());

        return usuarioRepository.save(u);
    }
    // EXCLUIR
    @DeleteMapping("/{id}")
    public void excluirUsuario(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
    }
	

}
