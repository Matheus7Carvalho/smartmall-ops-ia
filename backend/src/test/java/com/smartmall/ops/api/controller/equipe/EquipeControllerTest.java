package com.smartmall.ops.api.controller.equipe;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.equipe.IEquipeMapperImpl;
import com.smartmall.ops.domain.service.equipe.IEquipeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EquipeController.class)
@Import({IEquipeMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class EquipeControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private IEquipeService service;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessa() throws Exception {
        mvc.perform(get("/api/equipe")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void criaERetornaOsMembrosComNome() throws Exception {
        when(service.create(any())).thenAnswer(inv -> {
            Equipe e = inv.getArgument(0);
            var joao = new Usuario("João Costa", "j@x", "h", Perfil.FUNCIONARIO, true);
            joao.setId(e.getMembros().getFirst().getId());
            return new Equipe(e.getNome(), List.of(joao));
        });

        mvc.perform(post("/api/equipe").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Climatização\",\"membrosIds\":[\"u1\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.membros[0].id").value("u1"))
                .andExpect(jsonPath("$.membros[0].nome").value("João Costa"))
                .andExpect(jsonPath("$.membros[0].senha").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void validaNomeELimites() throws Exception {
        mvc.perform(post("/api/equipe").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"%s\"}".formatted("X".repeat(61))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].message").value("O nome deve ter até 60 caracteres."));
        verifyNoInteractions(service);
    }
}
