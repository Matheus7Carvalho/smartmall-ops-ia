package com.smartmall.ops.api.controller.checklist;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.model.checklist.IChecklistMapperImpl;
import com.smartmall.ops.domain.service.checklist.IChecklistService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChecklistController.class)
@Import({IChecklistMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class ChecklistControllerTest {

    private static final String VALIDO = """
            {"nome":"Elevador","itens":[
              {"pergunta":"Portas ok?","tipoResposta":"SIM_NAO","obrigatorio":true},
              {"pergunta":"Desnível (mm)","tipoResposta":"NUMERO","obrigatorio":true},
              {"pergunta":"Observações","tipoResposta":"TEXTO","obrigatorio":false,"maxCaracteres":500}
            ]}""";

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IChecklistService service;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private ResultActions criar(String json) throws Exception {
        return mvc.perform(post("/api/checklist").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    @WithAnonymousUser
    void exigeSessao() throws Exception {
        mvc.perform(get("/api/checklist")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessa() throws Exception {
        mvc.perform(get("/api/checklist")).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Acesso não permitido para o seu perfil."));
        criar(VALIDO).andExpect(status().isForbidden());
        mvc.perform(delete("/api/checklist/1")).andExpect(status().isForbidden());

        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void supervisorCriaChecklistComItensMapeados() throws Exception {
        when(service.create(any())).thenAnswer(inv -> inv.getArgument(0));

        criar(VALIDO)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Elevador"))
                .andExpect(jsonPath("$.itens.length()").value(3))
                .andExpect(jsonPath("$.itens[2].tipoResposta").value("TEXTO"))
                .andExpect(jsonPath("$.itens[2].maxCaracteres").value(500));

        var captor = ArgumentCaptor.forClass(Checklist.class);
        verify(service).create(captor.capture());
        assertThat(captor.getValue().getItens()).allSatisfy(item -> assertThat(item.getChecklist()).isSameAs(captor.getValue()));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void administradorTambemAcessa() throws Exception {
        when(service.create(any())).thenAnswer(inv -> inv.getArgument(0));

        criar(VALIDO).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void validaCamposObrigatorios() throws Exception {
        criar("{\"nome\":\"\",\"itens\":[]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field == 'nome')].message").value("Informe o nome."))
                .andExpect(jsonPath("$.errors[?(@.field == 'itens')].message").value("Adicione pelo menos um item."));
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void validaItens() throws Exception {
        criar("""
                {"nome":"X","itens":[{"pergunta":"","tipoResposta":null},{"pergunta":"Obs","tipoResposta":"TEXTO","maxCaracteres":501}]}""")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field == 'itens[0].pergunta')].message").value("Informe a pergunta."))
                .andExpect(jsonPath("$.errors[?(@.field == 'itens[0].tipoResposta')].message").value("Informe o tipo de resposta."))
                .andExpect(jsonPath("$.errors[?(@.field == 'itens[1].maxCaracteres')].message").value("O máximo de caracteres deve ser entre 1 e 500."));
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void tipoDeRespostaInvalidoRetorna400() throws Exception {
        criar("{\"nome\":\"X\",\"itens\":[{\"pergunta\":\"P\",\"tipoResposta\":\"DATA\"}]}")
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void excluiRetornando204() throws Exception {
        mvc.perform(delete("/api/checklist/id-1")).andExpect(status().isNoContent());

        verify(service).delete("id-1");
    }
}
