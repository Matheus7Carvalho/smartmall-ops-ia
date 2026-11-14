package com.smartmall.ops.api.controller.auth;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.security.SessaoService;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfiguration.class, PasswordConfiguration.class, SessaoService.class})
class AuthControllerTest {

    private static final String EMAIL = "supervisor@smartmall.local";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        cadastrar(true);
    }

    private void cadastrar(boolean ativo) {
        doAnswer(inv -> {
            if (!EMAIL.equals(inv.getArgument(0))) throw new UsernameNotFoundException("x");
            return usuario(ativo);
        }).when(userDetailsService).loadUserByUsername(anyString());
    }

    @Test
    void loginAbreSessaoComPerfil() throws Exception {
        var session = (MockHttpSession) mvc.perform(login(EMAIL, "demo123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza"))
                .andExpect(jsonPath("$.perfil").value("SUPERVISOR"))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andReturn().getRequest().getSession();

        mvc.perform(get("/api/auth/sessao").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL));
    }

    @Test
    void senhaErradaRetorna401() throws Exception {
        mvc.perform(login(EMAIL, "errada"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));
    }

    @Test
    void emailInexistenteRetornaMesmaMensagem() throws Exception {
        mvc.perform(login("ninguem@smartmall.local", "demo123"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));
    }

    @Test
    void usuarioInativoNaoEntra() throws Exception {
        cadastrar(false);

        mvc.perform(login(EMAIL, "demo123"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Usuário inativo."));
    }

    @Test
    void camposVaziosRetornam400() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"\",\"senha\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()").value(2));
    }

    @Test
    void sessaoSemLoginRetorna401() throws Exception {
        mvc.perform(get("/api/auth/sessao"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Sessão expirada. Entre novamente."));
    }

    @Test
    void logoutEncerraSessao() throws Exception {
        var session = (MockHttpSession) mvc.perform(login(EMAIL, "demo123")).andReturn().getRequest().getSession();

        mvc.perform(post("/api/auth/logout").session(session)).andExpect(status().isNoContent());

        mvc.perform(get("/api/auth/sessao").session(session)).andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.RequestBuilder login(String email, String senha) {
        return post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(email, senha));
    }

    private UsuarioAutenticado usuario(boolean ativo) {
        return new UsuarioAutenticado(new Usuario("Ana Souza", EMAIL, passwordEncoder.encode("demo123"), Perfil.SUPERVISOR, ativo));
    }
}
