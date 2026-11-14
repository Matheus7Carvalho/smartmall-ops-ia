package com.smartmall.ops.api.config.security;

import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.service.usuario.IUsuarioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioDetailsServiceTest {

    @Mock
    private IUsuarioService usuarioService;

    @InjectMocks
    private UsuarioDetailsService detailsService;

    @Test
    void carregaUsuarioPeloEmail() {
        var usuario = new Usuario("João Costa", "funcionario@smartmall.local", "hash", Perfil.FUNCIONARIO, true);
        when(usuarioService.buscarPorEmail("funcionario@smartmall.local")).thenReturn(Optional.of(usuario));

        var detalhes = detailsService.loadUserByUsername("funcionario@smartmall.local");

        assertThat(detalhes).isInstanceOf(UsuarioAutenticado.class);
        assertThat(((UsuarioAutenticado) detalhes).getPerfil()).isEqualTo(Perfil.FUNCIONARIO);
    }

    @Test
    void emailInexistenteLancaUsernameNotFound() {
        when(usuarioService.buscarPorEmail("ninguem@smartmall.local")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> detailsService.loadUserByUsername("ninguem@smartmall.local"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
