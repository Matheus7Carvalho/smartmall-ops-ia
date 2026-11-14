package com.smartmall.ops.api.controller.tarefa;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.tarefa.ArquivoEvidencia;
import com.smartmall.ops.domain.model.tarefa.Ator;
import com.smartmall.ops.domain.model.tarefa.AvaliacaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.ExecucaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.TarefaDetalheResponse;
import com.smartmall.ops.domain.service.tarefa.IExecucaoTarefaService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExecucaoTarefaController.class)
@Import({WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class ExecucaoTarefaControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private IExecucaoTarefaService service;
    @MockitoBean private UserDetailsService userDetailsService;

    private RequestPostProcessor como(Perfil perfil) {
        var usuario = new Usuario("Teste", "t@smartmall.local", "h", perfil, true);
        usuario.setId("u-" + perfil.name().toLowerCase());
        var autenticado = new UsuarioAutenticado(usuario);
        when(userDetailsService.loadUserByUsername(usuario.getEmail())).thenReturn(autenticado);
        return user(autenticado);
    }

    private static TarefaDetalheResponse detalhe() {
        return TarefaDetalheResponse.builder().itens(List.of()).evidencias(List.of()).historico(List.of())
                .acoes(new TarefaDetalheResponse.Acoes(false, true, false)).build();
    }

    @Test
    void funcionarioAssumeComoEleMesmo() throws Exception {
        when(service.assumir(any(), any())).thenReturn(detalhe());

        mvc.perform(post("/api/tarefa/t1/assumir").with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.acoes.executar").value(true));

        verify(service).assumir("t1", new Ator("u-funcionario", Perfil.FUNCIONARIO));
    }

    @Test
    void anexaImagemMultipart() throws Exception {
        when(service.adicionarEvidencia(any(), any(), any(), any())).thenReturn(detalhe());
        var arquivo = new MockMultipartFile("arquivo", "painel.png", "image/png", new byte[]{1, 2, 3});

        mvc.perform(multipart("/api/tarefa/t1/evidencia").file(arquivo).with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isOk());

        var bytes = ArgumentCaptor.forClass(byte[].class);
        verify(service).adicionarEvidencia(eq("t1"), eq("painel.png"), bytes.capture(), any());
        assertThat(bytes.getValue()).containsExactly(1, 2, 3);
    }

    @Test
    void devolveAImagemComOTipoGravado() throws Exception {
        when(service.arquivo(any(), any(), any())).thenReturn(new ArquivoEvidencia("painel.png", "image/png", new byte[]{9, 8}));

        mvc.perform(get("/api/tarefa/t1/evidencia/ev1/arquivo").with(como(Perfil.SUPERVISOR)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(header().string("Content-Disposition", startsWith("inline;")))
                .andExpect(header().string("Content-Disposition", containsString("filename*=UTF-8''painel.png")))
                .andExpect(content().bytes(new byte[]{9, 8}));
    }

    @Test
    void observacaoAcimaDoLimiteRetorna400() throws Exception {
        mvc.perform(post("/api/tarefa/t1/enviar").with(como(Perfil.FUNCIONARIO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"observacao\":\"" + "a".repeat(501) + "\",\"respostas\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field == 'observacao')].message").value("A observação deve ter no máximo 500 caracteres."));
        verifyNoInteractions(service);
    }

    @Test
    void enviaComRespostas() throws Exception {
        when(service.enviar(any(), any(), any())).thenReturn(detalhe());

        mvc.perform(post("/api/tarefa/t1/enviar").with(como(Perfil.FUNCIONARIO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"observacao\":\"ok\",\"respostas\":[{\"itemId\":\"i1\",\"resposta\":\"SIM\"}]}"))
                .andExpect(status().isOk());

        var request = ArgumentCaptor.forClass(ExecucaoTarefaRequest.class);
        verify(service).enviar(eq("t1"), request.capture(), any());
        assertThat(request.getValue().getRespostas()).singleElement().satisfies(r -> assertThat(r.getResposta()).isEqualTo("SIM"));
    }

    @Test
    void supervisorReprovaComMotivo() throws Exception {
        when(service.reprovar(any(), any(), any())).thenReturn(detalhe());

        mvc.perform(post("/api/tarefa/t1/reprovar").with(como(Perfil.SUPERVISOR))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"observacao\":\"Foto escura\"}"))
                .andExpect(status().isOk());

        var request = ArgumentCaptor.forClass(AvaliacaoTarefaRequest.class);
        verify(service).reprovar(eq("t1"), request.capture(), eq(new Ator("u-supervisor", Perfil.SUPERVISOR)));
        assertThat(request.getValue().getObservacao()).isEqualTo("Foto escura");
    }

    @Test
    void funcionarioNaoAvaliaNemVeAFila() throws Exception {
        mvc.perform(post("/api/tarefa/t1/aprovar").with(como(Perfil.FUNCIONARIO))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/tarefa/t1/reprovar").with(como(Perfil.FUNCIONARIO))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"observacao\":\"x\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/tarefa/em-analise").with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Acesso não permitido para o seu perfil."));
        verifyNoInteractions(service);
    }

    @Test
    void administradorVeAFila() throws Exception {
        when(service.emAnalise()).thenReturn(List.of());

        mvc.perform(get("/api/tarefa/em-analise").with(como(Perfil.ADMINISTRADOR))).andExpect(status().isOk());

        verify(service).emAnalise();
    }

    @Test
    void semSessaoRetorna401() throws Exception {
        mvc.perform(get("/api/tarefa/t1")).andExpect(status().isUnauthorized());
    }
}
