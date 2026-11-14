package com.smartmall.ops.api.controller.chamado;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.*;
import com.smartmall.ops.domain.model.chamado.ChamadoResponse;
import com.smartmall.ops.domain.service.chamado.ChamadoService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChamadoController.class)
@Import({SecurityConfiguration.class, PasswordConfiguration.class})
class ChamadoControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ChamadoService service;
    @MockitoBean UserDetailsService userDetailsService;

    private UsuarioAutenticado supervisor() {
        var usuario = new Usuario("Supervisor", "s@smartmall.local", "h", Perfil.SUPERVISOR, true);
        usuario.setId("u1");
        var autenticado = new UsuarioAutenticado(usuario);
        when(userDetailsService.loadUserByUsername(usuario.getEmail())).thenReturn(autenticado);
        return autenticado;
    }

    @Test void listaFilaPorStatusComPaginacao() throws Exception {
        when(service.listar(StatusChamado.EM_ANALISE, 0, 20)).thenReturn(new PageImpl<>(List.of()));
        mvc.perform(get("/api/chamado").param("status", "EM_ANALISE").with(user(supervisor())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray());
        verify(service).listar(StatusChamado.EM_ANALISE, 0, 20);
    }

    @Test void downloadDeMidiaExigeAcessoInternoENaoArmazenaCache() throws Exception {
        when(service.midia("c1")).thenReturn(new ChamadoService.MidiaPrivada("foto.png", "image/png", new byte[]{1,2}));
        mvc.perform(get("/api/chamado/c1/midia").with(user(supervisor())))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")));
    }

    @Test void aprovacaoPassaDadosEAtorAoServico() throws Exception {
        mvc.perform(post("/api/chamado/c1/aprovar").with(user(supervisor()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"tipo":"MANUTENCAO","prioridade":"ALTA","equipeId":"e1","dataHoraPrevista":"2026-11-15T10:00:00","duracaoMinutos":30}
                        """))
                .andExpect(status().isOk());
        verify(service).aprovar(eq("c1"), any(), eq("u1"));
    }
}
