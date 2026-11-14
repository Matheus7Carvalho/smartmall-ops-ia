package com.smartmall.ops.api.controller.relatorio;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import com.smartmall.ops.domain.model.relatorio.FiltroRelatorio;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse.Contagem;
import com.smartmall.ops.domain.service.relatorio.IRelatorioService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RelatorioController.class)
@Import({WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class RelatorioControllerTest {

    private static final String URL = "/api/relatorio/tarefas";

    @Autowired private MockMvc mvc;
    @MockitoBean private IRelatorioService service;
    @MockitoBean private UserDetailsService userDetailsService;

    private static RelatorioTarefasResponse relatorio() {
        var c = new Contagem(10, 2, 1, 1, 1, 4, 1, 2, 44);
        return new RelatorioTarefasResponse(LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 30), c,
                List.of(new RelatorioTarefasResponse.PorEquipe("e1", "Elevadores", c)),
                List.of(new RelatorioTarefasResponse.PorEquipamento("q1", "ELV-E1", "Elevador E1", CondicaoEquipamento.OPERANDO, c)));
    }

    @Test
    void semSessaoResponde401() throws Exception {
        mvc.perform(get(URL).param("de", "2026-11-01").param("ate", "2026-11-30")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessa() throws Exception {
        mvc.perform(get(URL).param("de", "2026-11-01").param("ate", "2026-11-30")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorRecebeORelatorioComOFiltro() throws Exception {
        when(service.tarefas(any())).thenReturn(relatorio());

        mvc.perform(get(URL).param("de", "2026-11-01").param("ate", "2026-11-30").param("equipeId", "e1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totais.total").value(10))
                .andExpect(jsonPath("$.totais.taxaConclusao").value(44))
                .andExpect(jsonPath("$.porEquipe[0].nome").value("Elevadores"))
                .andExpect(jsonPath("$.porEquipamento[0].codigo").value("ELV-E1"))
                .andExpect(jsonPath("$.porEquipamento[0].condicao").value("OPERANDO"));

        var filtro = ArgumentCaptor.forClass(FiltroRelatorio.class);
        verify(service).tarefas(filtro.capture());
        assertThat(filtro.getValue().getDe()).isEqualTo(LocalDate.of(2026, 11, 1));
        assertThat(filtro.getValue().getEquipeId()).isEqualTo("e1");
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void periodoEhObrigatorio() throws Exception {
        mvc.perform(get(URL)).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
