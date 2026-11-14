package com.smartmall.ops.api.controller.teste;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.service.teste.LimpezaE2EService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LimpezaE2EController.class)
@ActiveProfiles("dev")
@Import({WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class LimpezaE2EControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private LimpezaE2EService service;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void administradorApagaOsDadosDaMarca() throws Exception {
        mvc.perform(delete("/api/teste/e2e").param("marca", "E2E-AB12CD34")).andExpect(status().isNoContent());

        verify(service).excluirMarcados("E2E-AB12CD34");
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorNaoUsa() throws Exception {
        mvc.perform(delete("/api/teste/e2e").param("marca", "E2E-AB12CD34")).andExpect(status().isForbidden());

        verifyNoInteractions(service);
    }

    @Test
    void semSessaoRetorna401() throws Exception {
        mvc.perform(delete("/api/teste/e2e").param("marca", "E2E-AB12CD34")).andExpect(status().isUnauthorized());
    }
}
