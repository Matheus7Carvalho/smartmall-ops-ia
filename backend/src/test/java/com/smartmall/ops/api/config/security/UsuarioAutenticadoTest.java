package com.smartmall.ops.api.config.security;

import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.security.core.GrantedAuthority;

import static org.assertj.core.api.Assertions.assertThat;

class UsuarioAutenticadoTest {

    private Usuario usuario(Perfil perfil, Boolean ativo) {
        var usuario = new Usuario("Ana Souza", "supervisor@smartmall.local", "$2a$10$hash", perfil, ativo);
        usuario.setId("id-1");
        return usuario;
    }

    @ParameterizedTest
    @EnumSource(Perfil.class)
    void perfilViraRole(Perfil perfil) {
        var autenticado = new UsuarioAutenticado(usuario(perfil, true));

        assertThat(autenticado.getAuthorities()).extracting(GrantedAuthority::getAuthority).containsExactly("ROLE_" + perfil.name());
    }

    @Test
    void usaEmailComoUsername() {
        var autenticado = new UsuarioAutenticado(usuario(Perfil.SUPERVISOR, true));

        assertThat(autenticado.getUsername()).isEqualTo("supervisor@smartmall.local");
        assertThat(autenticado.getPassword()).isEqualTo("$2a$10$hash");
    }

    @Test
    void usuarioInativoNaoFicaHabilitado() {
        assertThat(new UsuarioAutenticado(usuario(Perfil.FUNCIONARIO, false)).isEnabled()).isFalse();
        assertThat(new UsuarioAutenticado(usuario(Perfil.FUNCIONARIO, null)).isEnabled()).isFalse();
        assertThat(new UsuarioAutenticado(usuario(Perfil.FUNCIONARIO, true)).isEnabled()).isTrue();
    }

    @Test
    void apagaHashDaSenhaAposAutenticar() {
        var autenticado = new UsuarioAutenticado(usuario(Perfil.SUPERVISOR, true));

        autenticado.eraseCredentials();

        assertThat(autenticado.getPassword()).isNull();
    }

    @Test
    void respostaNaoExpoeSenha() {
        var resposta = new UsuarioAutenticado(usuario(Perfil.ADMINISTRADOR, true)).toResponse();

        assertThat(resposta.getId()).isEqualTo("id-1");
        assertThat(resposta.getNome()).isEqualTo("Ana Souza");
        assertThat(resposta.getEmail()).isEqualTo("supervisor@smartmall.local");
        assertThat(resposta.getPerfil()).isEqualTo(Perfil.ADMINISTRADOR);
        assertThat(resposta.getAtivo()).isTrue();
        assertThat(resposta.getClass().getDeclaredFields()).extracting("name").doesNotContain("senha");
    }
}
