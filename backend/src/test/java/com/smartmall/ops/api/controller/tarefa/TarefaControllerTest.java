package com.smartmall.ops.api.controller.tarefa;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.tarefa.FiltroTarefas;
import com.smartmall.ops.domain.model.tarefa.ResumoTarefasResponse;
import com.smartmall.ops.domain.service.tarefa.ITarefaService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TarefaController.class)
@Import({WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class TarefaControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private ITarefaService service;
    @MockitoBean private UserDetailsService userDetailsService;

    private RequestPostProcessor como(Perfil perfil) {
        var usuario = new Usuario("Teste", "t@smartmall.local", "h", perfil, true);
        usuario.setId("u-" + perfil.name().toLowerCase());
        var autenticado = new UsuarioAutenticado(usuario);
        when(userDetailsService.loadUserByUsername(usuario.getEmail())).thenReturn(autenticado);
        return user(autenticado);
    }

    @Test
    void funcionarioVeSoAsDasSuasEquipes() throws Exception {
        when(service.agenda(any(), any())).thenReturn(List.of());

        mvc.perform(get("/api/tarefa").param("de", "2026-11-01").param("ate", "2026-11-30").with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isOk());

        var filtro = ArgumentCaptor.forClass(FiltroTarefas.class);
        verify(service).agenda(filtro.capture(), eq("u-funcionario"));
        assertThat(filtro.getValue().getDe()).isEqualTo(LocalDate.of(2026, 11, 1));
        assertThat(filtro.getValue().getAte()).isEqualTo(LocalDate.of(2026, 11, 30));
    }

    @Test
    void supervisorVeTodas() throws Exception {
        when(service.agenda(any(), any())).thenReturn(List.of());

        mvc.perform(get("/api/tarefa").param("de", "2026-11-01").param("ate", "2026-11-30")
                        .param("situacao", "ATRASADA").with(como(Perfil.SUPERVISOR)))
                .andExpect(status().isOk());

        var filtro = ArgumentCaptor.forClass(FiltroTarefas.class);
        verify(service).agenda(filtro.capture(), isNull());
        assertThat(filtro.getValue().getSituacao()).isEqualTo(FiltroTarefas.Situacao.ATRASADA);
    }

    @Test
    void periodoEhObrigatorio() throws Exception {
        mvc.perform(get("/api/tarefa").with(como(Perfil.SUPERVISOR)))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void resumoDoFuncionarioUsaOMembro() throws Exception {
        when(service.resumo("u-funcionario")).thenReturn(new ResumoTarefasResponse(1, 2, 3));

        mvc.perform(get("/api/tarefa/resumo").with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.atrasadas").value(1))
                .andExpect(jsonPath("$.proximos7Dias").value(2))
                .andExpect(jsonPath("$.agendadasNoMes").value(3));
    }

    @Test
    void funcionarioNaoCancelaNemRestaura() throws Exception {
        mvc.perform(post("/api/tarefa/m1/cancelar").with(como(Perfil.FUNCIONARIO))).andExpect(status().isForbidden());
        mvc.perform(post("/api/tarefa/m1/restaurar").with(como(Perfil.FUNCIONARIO))).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    void supervisorCancela() throws Exception {
        mvc.perform(post("/api/tarefa/m1/cancelar").with(como(Perfil.SUPERVISOR))).andExpect(status().isOk());

        verify(service).cancelar("m1", "u-supervisor");
    }

    @Test
    void semSessaoRetorna401() throws Exception {
        mvc.perform(get("/api/tarefa").param("de", "2026-11-01").param("ate", "2026-11-30"))
                .andExpect(status().isUnauthorized());
    }
}
