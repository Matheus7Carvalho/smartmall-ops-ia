package com.smartmall.ops.api.controller.disponibilidade;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.MotivoAusencia;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.disponibilidade.AusenciaResponse;
import com.smartmall.ops.domain.model.disponibilidade.FuncionarioDisponibilidadeResponse;
import com.smartmall.ops.domain.model.disponibilidade.SituacaoFuncionario;
import com.smartmall.ops.domain.service.disponibilidade.IDisponibilidadeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DisponibilidadeController.class)
@Import({WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class DisponibilidadeControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private IDisponibilidadeService service;
    @MockitoBean private UserDetailsService userDetailsService;

    private RequestPostProcessor como(Perfil perfil) {
        var usuario = new Usuario("Teste", "t@smartmall.local", "h", perfil, true);
        usuario.setId("u-" + perfil.name().toLowerCase());
        var autenticado = new UsuarioAutenticado(usuario);
        when(userDetailsService.loadUserByUsername(usuario.getEmail())).thenReturn(autenticado);
        return user(autenticado);
    }

    private static final String AUSENCIA = """
            {"usuarioId": "u-1", "inicio": "2026-11-20", "fim": "2026-11-22", "motivo": "FERIAS"}
            """;

    @Test
    void semSessaoResponde401() throws Exception {
        mvc.perform(get("/api/disponibilidade")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    void funcionarioNaoVeADisponibilidade() throws Exception {
        mvc.perform(get("/api/disponibilidade").with(como(Perfil.FUNCIONARIO))).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    void funcionarioNaoRegistraAusencia() throws Exception {
        mvc.perform(post("/api/ausencia").with(como(Perfil.FUNCIONARIO)).contentType(MediaType.APPLICATION_JSON).content(AUSENCIA))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/ausencia/a1/encerrar").with(como(Perfil.FUNCIONARIO))).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    void supervisorVeASituacaoSemDadosPessoais() throws Exception {
        when(service.hoje()).thenReturn(List.of(new FuncionarioDisponibilidadeResponse(
                "u-1", "Ana", List.of(new FuncionarioDisponibilidadeResponse.Resumo("e1", "Elevadores")),
                SituacaoFuncionario.INDISPONIVEL, null, 0,
                new AusenciaResponse("a1", MotivoAusencia.FERIAS, LocalDate.of(2026, 11, 14), LocalDate.of(2026, 11, 20)))));

        mvc.perform(get("/api/disponibilidade").with(como(Perfil.SUPERVISOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Ana"))
                .andExpect(jsonPath("$[0].situacao").value("INDISPONIVEL"))
                .andExpect(jsonPath("$[0].equipes[0].nome").value("Elevadores"))
                .andExpect(jsonPath("$[0].ausencia.motivo").value("FERIAS"))
                .andExpect(jsonPath("$[0].ausencia.fim").value("2026-11-20"))
                .andExpect(jsonPath("$[0].email").doesNotExist());
    }

    @Test
    void registraAusenciaComOGestorLogado() throws Exception {
        when(service.registrarAusencia(any(), eq("u-administrador")))
                .thenReturn(new AusenciaResponse("a1", MotivoAusencia.FERIAS, LocalDate.of(2026, 11, 20), LocalDate.of(2026, 11, 22)));

        mvc.perform(post("/api/ausencia").with(como(Perfil.ADMINISTRADOR)).contentType(MediaType.APPLICATION_JSON).content(AUSENCIA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("a1"));
        verify(service).registrarAusencia(any(), eq("u-administrador"));
    }

    @Test
    void validaCamposObrigatorios() throws Exception {
        mvc.perform(post("/api/ausencia").with(como(Perfil.SUPERVISOR)).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void encerraAusencia() throws Exception {
        mvc.perform(post("/api/ausencia/a1/encerrar").with(como(Perfil.SUPERVISOR))).andExpect(status().isNoContent());
        verify(service).encerrarAusencia("a1");
    }
}
