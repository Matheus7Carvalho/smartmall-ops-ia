package com.smartmall.ops.api.controller.equipamento;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.model.equipamento.IEquipamentoMapperImpl;
import com.smartmall.ops.domain.service.equipamento.IEquipamentoService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EquipamentoController.class)
@Import({IEquipamentoMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class EquipamentoControllerTest {

    private static final String VALIDO = """
            {"codigo":"ELV-E9","nome":"Elevador E9","categoria":"ELEVADOR","pisoId":"p1","localizacao":"Praça","condicao":"OPERANDO"}""";

    @Autowired private MockMvc mvc;
    @MockitoBean private IEquipamentoService service;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessa() throws Exception {
        mvc.perform(get("/api/equipamento")).andExpect(status().isForbidden());
        mvc.perform(post("/api/equipamento").contentType(MediaType.APPLICATION_JSON).content(VALIDO)).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void criaEnviandoOPisoComoReferencia() throws Exception {
        when(service.create(any())).thenAnswer(inv -> {
            Equipamento e = inv.getArgument(0);
            var piso = new Piso("L1", "Piso L1", 1);
            piso.setId(e.getPiso().getId());
            e.setPiso(piso);
            return e;
        });

        mvc.perform(post("/api/equipamento").contentType(MediaType.APPLICATION_JSON).content(VALIDO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pisoId").value("p1"))
                .andExpect(jsonPath("$.pisoNome").value("Piso L1"));

        var captor = ArgumentCaptor.forClass(Equipamento.class);
        verify(service).create(captor.capture());
        assertThat(captor.getValue().getPiso().getId()).isEqualTo("p1");
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void validaCamposELimites() throws Exception {
        mvc.perform(post("/api/equipamento").contentType(MediaType.APPLICATION_JSON).content("""
                        {"codigo":"%s","nome":"","categoria":null,"pisoId":"","localizacao":"","condicao":null}""".formatted("X".repeat(21))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field == 'codigo')].message").value("O código deve ter até 20 caracteres."))
                .andExpect(jsonPath("$.errors[?(@.field == 'nome')].message").value("Informe o nome."))
                .andExpect(jsonPath("$.errors[?(@.field == 'categoria')].message").value("Selecione a categoria."))
                .andExpect(jsonPath("$.errors[?(@.field == 'pisoId')].message").value("Selecione o piso."))
                .andExpect(jsonPath("$.errors[?(@.field == 'condicao')].message").value("Selecione a condição."));
        verifyNoInteractions(service);
    }
}
