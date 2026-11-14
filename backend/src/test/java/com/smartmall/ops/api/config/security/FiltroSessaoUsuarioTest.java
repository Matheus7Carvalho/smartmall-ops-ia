package com.smartmall.ops.api.config.security;

import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.api.controller.auth.AuthController;
import com.smartmall.ops.api.controller.usuario.UsuarioController;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.usuario.IUsuarioMapperImpl;
import com.smartmall.ops.domain.service.usuario.IUsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.atomic.AtomicReference;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({AuthController.class, UsuarioController.class})
@Import({IUsuarioMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class,
        PasswordConfiguration.class, SessaoService.class})
class FiltroSessaoUsuarioTest {

    private static final String EMAIL = "admin@smartmall.local";

    @Autowired private MockMvc mvc;
    @Autowired private PasswordEncoder passwordEncoder;
    @MockitoBean private UserDetailsService userDetailsService;
    @MockitoBean private IUsuarioService usuarioService;

    private AtomicReference<Usuario> usuario;

    @BeforeEach
    void preparar() {
        usuario = new AtomicReference<>(usuario("id-1", Perfil.ADMINISTRADOR, true));
        when(userDetailsService.loadUserByUsername(anyString())).thenAnswer(inv -> {
            if (!EMAIL.equals(inv.getArgument(0)) || usuario.get() == null)
                throw new UsernameNotFoundException("Usuario removido");
            return new UsuarioAutenticado(usuario.get());
        });
    }

    @Test
    void perfilAlteradoPassaAValerNaSessaoAberta() throws Exception {
        var session = entrar();
        usuario.set(usuario("id-1", Perfil.FUNCIONARIO, true));

        mvc.perform(get("/api/usuario/funcionarios").session(session))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/auth/sessao").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("FUNCIONARIO"));
    }

    @Test
    void desativacaoEncerraSessaoAberta() throws Exception {
        var session = entrar();
        usuario.set(usuario("id-1", Perfil.ADMINISTRADOR, false));

        mvc.perform(get("/api/auth/sessao").session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Sessão expirada. Entre novamente."));
    }

    @Test
    void exclusaoEncerraSessaoAberta() throws Exception {
        var session = entrar();
        usuario.set(null);

        mvc.perform(get("/api/auth/sessao").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void emailReutilizadoNaoHerdaPermissoesDaNovaConta() throws Exception {
        var session = entrar();
        usuario.set(usuario("id-2", Perfil.ADMINISTRADOR, true));

        mvc.perform(get("/api/auth/sessao").session(session))
                .andExpect(status().isUnauthorized());
    }

    private MockHttpSession entrar() throws Exception {
        return (MockHttpSession) mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + EMAIL + "\",\"senha\":\"demo123\"}"))
                .andExpect(status().isOk())
                .andReturn().getRequest().getSession();
    }

    private Usuario usuario(String id, Perfil perfil, boolean ativo) {
        var entity = new Usuario("Admin", EMAIL, passwordEncoder.encode("demo123"), perfil, ativo);
        entity.setId(id);
        return entity;
    }
}
