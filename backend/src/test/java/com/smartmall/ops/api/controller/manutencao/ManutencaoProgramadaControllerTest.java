package com.smartmall.ops.api.controller.manutencao;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import com.smartmall.ops.domain.model.manutencao.IManutencaoProgramadaMapperImpl;
import com.smartmall.ops.domain.service.manutencao.IManutencaoProgramadaService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ManutencaoProgramadaController.class)
@Import({IManutencaoProgramadaMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class ManutencaoProgramadaControllerTest {

    private static final String VALIDO = """
            {"equipamentoId":"eq","checklistId":"ck","equipeId":"tm","frequencia":"SEMANAL","intervalo":2,
             "dataInicio":"2026-11-16","horario":"08:00","duracaoMinutos":90,"observacoes":"Fora do pico"}""";

    @Autowired private MockMvc mvc;
    @MockitoBean private IManutencaoProgramadaService service;
    @MockitoBean private UserDetailsService userDetailsService;

    private static ManutencaoProgramada programada() {
        var p = new ManutencaoProgramada();
        p.setId("programada-1");
        var eq = new Equipamento();
        eq.setId("eq");
        eq.setCodigo("ELV-E1");
        eq.setNome("Elevador E1");
        var ck = new Checklist();
        ck.setId("ck");
        ck.setNome("Elevador");
        var tm = new Equipe("Elevadores", List.of());
        tm.setId("tm");
        p.setEquipamento(eq);
        p.setChecklist(ck);
        p.setEquipe(tm);
        p.setFrequencia(Frequencia.SEMANAL);
        p.setIntervalo(2);
        p.setDataInicio(LocalDate.of(2026, 11, 16));
        p.setHorario(LocalTime.of(8, 0));
        p.setDuracaoMinutos(90);
        p.setAtivo(true);
        return p;
    }

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessa() throws Exception {
        mvc.perform(get("/api/manutencao-programada")).andExpect(status().isForbidden());
        mvc.perform(post("/api/manutencao-programada/programada-1/encerrar")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void listagemTrazAProximaDataEResumos() throws Exception {
        when(service.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(programada())));
        when(service.proximasDatas(any())).thenReturn(Map.of("programada-1", LocalDateTime.of(2026, 11, 16, 8, 0)));

        mvc.perform(get("/api/manutencao-programada"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].proximaData").value("2026-11-16T08:00:00"))
                .andExpect(jsonPath("$.content[0].equipamento.codigo").value("ELV-E1"))
                .andExpect(jsonPath("$.content[0].equipe.nome").value("Elevadores"))
                .andExpect(jsonPath("$.content[0].horario").value("08:00"));
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void criaComReferenciasPorId() throws Exception {
        when(service.create(any())).thenReturn(programada());

        mvc.perform(post("/api/manutencao-programada").contentType(MediaType.APPLICATION_JSON).content(VALIDO))
                .andExpect(status().isOk());

        var captor = ArgumentCaptor.forClass(ManutencaoProgramada.class);
        verify(service).create(captor.capture());
        assertThat(captor.getValue().getEquipamento().getId()).isEqualTo("eq");
        assertThat(captor.getValue().getChecklist().getId()).isEqualTo("ck");
        assertThat(captor.getValue().getEquipe().getId()).isEqualTo("tm");
        assertThat(captor.getValue().getHorario()).isEqualTo(LocalTime.of(8, 0));
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void validaCamposELimites() throws Exception {
        mvc.perform(post("/api/manutencao-programada").contentType(MediaType.APPLICATION_JSON).content("""
                        {"equipamentoId":"","checklistId":"","equipeId":"","frequencia":null,"intervalo":13,
                         "dataInicio":null,"horario":null,"duracaoMinutos":10,"observacoes":"%s"}""".formatted("x".repeat(501))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field == 'equipamentoId')].message").value("Selecione o equipamento."))
                .andExpect(jsonPath("$.errors[?(@.field == 'intervalo')].message").value("O intervalo deve ser entre 1 e 12."))
                .andExpect(jsonPath("$.errors[?(@.field == 'duracaoMinutos')].message").value("A duração deve ser entre 15 e 720 minutos."))
                .andExpect(jsonPath("$.errors[?(@.field == 'observacoes')].message").value("As observações devem ter até 500 caracteres."))
                .andExpect(jsonPath("$.errors[?(@.field == 'dataInicio')].message").value("Informe a data de início."));
        verifyNoInteractions(service);
    }

    @Test
    void encerraRegistrandoQuemEncerrou() throws Exception {
        var encerrado = programada();
        encerrado.setAtivo(false);
        when(service.encerrar("programada-1", "u-admin")).thenReturn(encerrado);
        var admin = new Usuario("Admin", "a@smartmall.local", "h", Perfil.ADMINISTRADOR, true);
        admin.setId("u-admin");
        var autenticado = new UsuarioAutenticado(admin);
        when(userDetailsService.loadUserByUsername(admin.getEmail())).thenReturn(autenticado);

        mvc.perform(post("/api/manutencao-programada/programada-1/encerrar").with(user(autenticado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
    }
}
