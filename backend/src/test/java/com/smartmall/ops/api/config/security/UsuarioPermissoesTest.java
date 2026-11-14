package com.smartmall.ops.api.config.security;

import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.api.controller.usuario.UsuarioController;
import com.smartmall.ops.domain.model.usuario.IUsuarioMapperImpl;
import com.smartmall.ops.domain.service.usuario.IUsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
@Import({IUsuarioMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class UsuarioPermissoesTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private IUsuarioService service;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorNaoGerenciaUsuarios() throws Exception {
        mvc.perform(get("/api/usuario")).andExpect(status().isForbidden());
        mvc.perform(get("/api/usuario/1")).andExpect(status().isForbidden());
        mvc.perform(post("/api/usuario")).andExpect(status().isForbidden());
        mvc.perform(put("/api/usuario/1")).andExpect(status().isForbidden());
        mvc.perform(delete("/api/usuario/1")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoConsultaCandidatosAEquipe() throws Exception {
        mvc.perform(get("/api/usuario/funcionarios")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void administradorConsultaCandidatosAEquipe() throws Exception {
        when(service.funcionariosAtivos()).thenReturn(List.of());
        mvc.perform(get("/api/usuario/funcionarios")).andExpect(status().isOk());
    }
}
