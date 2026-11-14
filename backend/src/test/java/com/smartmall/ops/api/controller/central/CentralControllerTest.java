package com.smartmall.ops.api.controller.central;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.model.central.ResumoCentralResponse;
import com.smartmall.ops.domain.service.central.ICentralService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CentralController.class)
@Import({WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class CentralControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private ICentralService service;
    @MockitoBean private UserDetailsService userDetailsService;

    private static ResumoCentralResponse resumo() {
        return new ResumoCentralResponse(
                new ResumoCentralResponse.Tarefas(5, 3, 2),
                new ResumoCentralResponse.Equipes(2, 4),
                new ResumoCentralResponse.Equipamentos(10, 8, 80),
                new ResumoCentralResponse.Alertas(6, 1, 1, 1, 4));
    }

    @Test
    void semSessaoResponde401() throws Exception {
        mvc.perform(get("/api/central/resumo")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessa() throws Exception {
        mvc.perform(get("/api/central/resumo")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorRecebeOsIndicadores() throws Exception {
        when(service.resumo()).thenReturn(resumo());

        mvc.perform(get("/api/central/resumo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tarefas.ativas").value(5))
                .andExpect(jsonPath("$.tarefas.emExecucao").value(3))
                .andExpect(jsonPath("$.equipes.emOperacao").value(2))
                .andExpect(jsonPath("$.equipes.total").value(4))
                .andExpect(jsonPath("$.equipamentos.total").value(10))
                .andExpect(jsonPath("$.equipamentos.operando").value(8))
                .andExpect(jsonPath("$.equipamentos.percentualOperando").value(80))
                .andExpect(jsonPath("$.alertas.total").value(6))
                .andExpect(jsonPath("$.alertas.urgentes").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void administradorAcessa() throws Exception {
        when(service.resumo()).thenReturn(resumo());

        mvc.perform(get("/api/central/resumo")).andExpect(status().isOk());
    }
}
