package com.smartmall.ops.api.config.security;

import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.mockito.Mockito.verifyNoInteractions;

@WebMvcTest(AcessoChamadoPublicoTest.Endpoints.class)
@Import({SecurityConfiguration.class, PasswordConfiguration.class, AcessoChamadoPublicoTest.Endpoints.class})
class AcessoChamadoPublicoTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    void visitanteConsultaLocalERegistraSemSessao() throws Exception {
        mvc.perform(get("/api/publico/local/entrada")).andExpect(status().isNoContent());
        mvc.perform(post("/api/publico/chamado")).andExpect(status().isNoContent());
    }

    @Test
    void sessaoAntigaNaoBloqueiaFormularioPublico() throws Exception {
        var usuario = new Usuario("Ana", "ana@smartmall.local", "hash", Perfil.SUPERVISOR, true);
        usuario.setId("usuario-1");
        var principal = new UsuarioAutenticado(usuario);
        var autenticacao = UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities());

        mvc.perform(get("/api/publico/local/entrada").with(authentication(autenticacao)))
                .andExpect(status().isNoContent());
        verifyNoInteractions(userDetailsService);
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void outrasRotasPublicasNaoSaoLiberadasPorEngano() throws Exception {
        mvc.perform(get("/api/publico/chamado")).andExpect(status().isForbidden());
        mvc.perform(post("/api/publico/local/entrada")).andExpect(status().isForbidden());
    }

    @Test
    void visitanteNaoAcessaTriagemInterna() throws Exception {
        mvc.perform(get("/api/chamado")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/chamado/1/midia")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/chamado/1/aprovar")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessaTriagemInterna() throws Exception {
        mvc.perform(get("/api/chamado")).andExpect(status().isForbidden());
        mvc.perform(get("/api/chamado/1")).andExpect(status().isForbidden());
        mvc.perform(get("/api/chamado/1/midia")).andExpect(status().isForbidden());
        mvc.perform(post("/api/chamado/1/arquivar")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorAcessaTriagemInterna() throws Exception {
        mvc.perform(get("/api/chamado")).andExpect(status().isNoContent());
        mvc.perform(post("/api/chamado/1/aprovar")).andExpect(status().isNoContent());
    }

    @RestController
    static class Endpoints {
        @GetMapping("/api/publico/local/{codigo}") ResponseEntity<Void> local(@PathVariable String codigo) {
            return ResponseEntity.noContent().build();
        }
        @PostMapping("/api/publico/chamado") ResponseEntity<Void> registrar() {
            return ResponseEntity.noContent().build();
        }
        @GetMapping("/api/chamado") ResponseEntity<Void> listar() {
            return ResponseEntity.noContent().build();
        }
        @GetMapping("/api/chamado/{id}") ResponseEntity<Void> detalhe(@PathVariable String id) {
            return ResponseEntity.noContent().build();
        }
        @GetMapping("/api/chamado/{id}/midia") ResponseEntity<Void> midia(@PathVariable String id) {
            return ResponseEntity.noContent().build();
        }
        @PostMapping("/api/chamado/{id}/aprovar") ResponseEntity<Void> aprovar(@PathVariable String id) {
            return ResponseEntity.noContent().build();
        }
        @PostMapping("/api/chamado/{id}/arquivar") ResponseEntity<Void> arquivar(@PathVariable String id) {
            return ResponseEntity.noContent().build();
        }
    }
}
