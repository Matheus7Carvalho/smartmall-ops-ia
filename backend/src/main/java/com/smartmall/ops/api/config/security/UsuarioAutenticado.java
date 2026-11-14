package com.smartmall.ops.api.config.security;

import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.usuario.UsuarioResponse;
import lombok.Getter;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Principal guardado na sessão. Cópia enxuta do usuário; o hash da senha é apagado após a autenticação.
 * Authority no formato ROLE_<PERFIL>, para uso em @PreAuthorize("hasRole('SUPERVISOR')").
 */
@Getter
public class UsuarioAutenticado implements UserDetails, CredentialsContainer {

    private final String id;
    private final String nome;
    private final String email;
    private final Perfil perfil;
    private final boolean ativo;
    private String senha;

    public UsuarioAutenticado(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.perfil = usuario.getPerfil();
        this.ativo = Boolean.TRUE.equals(usuario.getAtivo());
        this.senha = usuario.getSenha();
    }

    public UsuarioResponse toResponse() {
        return UsuarioResponse.builder().id(id).nome(nome).email(email).perfil(perfil).ativo(ativo).build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil.name()));
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }

    @Override
    public void eraseCredentials() {
        this.senha = null;
    }
}
