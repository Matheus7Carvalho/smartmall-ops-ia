package com.smartmall.ops.domain.service.tarefa;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.model.tarefa.FiltroTarefas;
import com.smartmall.ops.domain.model.tarefa.TarefaResponse;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TarefaServiceTest {

    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);

    @Mock
    private TarefaRepository repository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private TarefaService service;
    private ManutencaoProgramada programada;

    @BeforeEach
    void setUp() {
        service = new TarefaService(repository, usuarioRepository, Clock.fixed(AGORA.atZone(FUSO).toInstant(), FUSO));
        var piso = new Piso("L1", "Piso L1", 1);
        var equipamento = new Equipamento("ELV-E1", "Elevador E1", null, piso, "Praça Central", null);
        equipamento.setId("eq");
        var checklist = new Checklist();
        checklist.setId("ck");
        checklist.setNome("Elevador");
        var equipe = new Equipe("Elevadores", List.of());
        equipe.setId("tm");
        programada = new ManutencaoProgramada();
        programada.setId("programada-1");
        programada.setEquipamento(equipamento);
        programada.setChecklist(checklist);
        programada.setEquipe(equipe);
        programada.setDuracaoMinutos(90);
        programada.setAtivo(true);
        lenient().when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private Tarefa m(String id, LocalDateTime dataHora, StatusTarefa status) {
        var m = new Tarefa(programada, dataHora);
        m.setId(id);
        m.setStatus(status);
        return m;
    }

    private FiltroTarefas filtro(FiltroTarefas.Situacao situacao) {
        return FiltroTarefas.builder().de(LocalDate.of(2026, 11, 1)).ate(LocalDate.of(2026, 11, 30)).situacao(situacao).build();
    }

    private void agendaCom(Tarefa... tarefas) {
        when(repository.buscar(any(), any(), any(), any(), any())).thenReturn(List.of(tarefas));
    }

    @Test
    void marcaAtrasadaAgendadaComDataPassada() {
        agendaCom(m("a", AGORA.minusHours(1), StatusTarefa.AGENDADA), m("b", AGORA.plusHours(1), StatusTarefa.AGENDADA));

        var agenda = service.agenda(filtro(null), null);

        assertThat(agenda).extracting(TarefaResponse::getId, TarefaResponse::isAtrasada)
                .containsExactly(org.assertj.core.groups.Tuple.tuple("a", true), org.assertj.core.groups.Tuple.tuple("b", false));
        assertThat(agenda.getFirst().getEquipamento().getCodigo()).isEqualTo("ELV-E1");
        assertThat(agenda.getFirst().getPiso()).isEqualTo("Piso L1");
        assertThat(agenda.getFirst().getDuracaoMinutos()).isEqualTo(90);
    }

    @Test
    void canceladaNoPassadoNaoEhAtrasada() {
        agendaCom(m("a", AGORA.minusDays(1), StatusTarefa.CANCELADA));

        assertThat(service.agenda(filtro(null), null).getFirst().isAtrasada()).isFalse();
    }

    @Test
    void filtraPorSituacao() {
        agendaCom(m("atrasada", AGORA.minusHours(1), StatusTarefa.AGENDADA),
                m("agendada", AGORA.plusHours(1), StatusTarefa.AGENDADA),
                m("cancelada", AGORA.plusHours(2), StatusTarefa.CANCELADA));

        assertThat(service.agenda(filtro(FiltroTarefas.Situacao.ATRASADA), null)).extracting(TarefaResponse::getId).containsExactly("atrasada");
        assertThat(service.agenda(filtro(FiltroTarefas.Situacao.AGENDADA), null)).extracting(TarefaResponse::getId).containsExactly("agendada");
        assertThat(service.agenda(filtro(FiltroTarefas.Situacao.CANCELADA), null)).extracting(TarefaResponse::getId).containsExactly("cancelada");
    }

    @Test
    void consultaUsaODiaFinalInteiroERepassaOMembro() {
        agendaCom();

        service.agenda(filtro(null), "usuario-1");

        verify(repository).buscar(eq(LocalDate.of(2026, 11, 1).atStartOfDay()), eq(LocalDate.of(2026, 12, 1).atStartOfDay()),
                isNull(), isNull(), eq("usuario-1"));
    }

    @Test
    void periodoInvertidoEhRecusado() {
        var filtro = FiltroTarefas.builder().de(LocalDate.of(2026, 11, 30)).ate(LocalDate.of(2026, 11, 1)).build();

        assertThatThrownBy(() -> service.agenda(filtro, null))
                .isInstanceOf(DomainException.class)
                .hasMessage("A data final não pode ser antes da inicial.");
    }

    @Test
    void periodoMaiorQue93DiasEhRecusado() {
        var filtro = FiltroTarefas.builder().de(LocalDate.of(2026, 1, 1)).ate(LocalDate.of(2026, 4, 4)).build();

        assertThatThrownBy(() -> service.agenda(filtro, null))
                .isInstanceOf(DomainException.class)
                .hasMessage("Consulte no máximo 93 dias por vez.");
    }

    @Test
    void resumoContaAtrasadasProximos7DiasEMes() {
        agendaCom(m("atrasada", AGORA.minusDays(3), StatusTarefa.AGENDADA),
                m("amanha", AGORA.plusDays(1), StatusTarefa.AGENDADA),
                m("em10dias", AGORA.plusDays(10), StatusTarefa.AGENDADA),
                m("cancelada", AGORA.plusDays(2), StatusTarefa.CANCELADA),
                m("dezembro", LocalDateTime.of(2026, 12, 2, 8, 0), StatusTarefa.AGENDADA));

        var resumo = service.resumo(null);

        assertThat(resumo.getAtrasadas()).isEqualTo(1);
        assertThat(resumo.getProximos7Dias()).isEqualTo(1);
        // Novembro: atrasada (11/11), amanhã (15/11) e em 10 dias (24/11).
        assertThat(resumo.getAgendadasNoMes()).isEqualTo(3);
    }

    @Test
    void cancelaAgendadaRegistrandoNoHistorico() {

        var tarefa = m("x", AGORA.plusDays(1), StatusTarefa.AGENDADA);
        when(repository.findById("x")).thenReturn(Optional.of(tarefa));
        var usuario = new Usuario("Sup", "s@smartmall.local", "h", Perfil.SUPERVISOR, true);
        when(usuarioRepository.getReferenceById("u1")).thenReturn(usuario);

        assertThat(service.cancelar("x", "u1").getStatus()).isEqualTo(StatusTarefa.CANCELADA);
        assertThat(tarefa.getHistorico()).singleElement().satisfies(h -> {
            assertThat(h.getAcao()).isEqualTo(AcaoTarefa.CANCELADA);
            assertThat(h.getUsuario()).isSameAs(usuario);
            assertThat(h.getDataHora()).isEqualTo(AGORA);
        });
    }

    @Test
    void naoCancelaOQueJaFoiCancelado() {
        when(repository.findById("x")).thenReturn(Optional.of(m("x", AGORA.plusDays(1), StatusTarefa.CANCELADA)));

        assertThatThrownBy(() -> service.cancelar("x", "u1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Só tarefas agendadas podem ser canceladas.");
    }

    @Test
    void restauraCanceladaFutura() {
        when(repository.findById("x")).thenReturn(Optional.of(m("x", AGORA.plusDays(1), StatusTarefa.CANCELADA)));

        assertThat(service.restaurar("x", "u1").getStatus()).isEqualTo(StatusTarefa.AGENDADA);
    }

    @Test
    void naoRestauraCanceladaPassada() {
        when(repository.findById("x")).thenReturn(Optional.of(m("x", AGORA.minusDays(1), StatusTarefa.CANCELADA)));

        assertThatThrownBy(() -> service.restaurar("x", "u1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Não é possível restaurar uma tarefa com data passada.");
    }

    @Test
    void naoRestauraDePlanoEncerrado() {
        programada.setAtivo(false);
        when(repository.findById("x")).thenReturn(Optional.of(m("x", AGORA.plusDays(1), StatusTarefa.CANCELADA)));

        assertThatThrownBy(() -> service.restaurar("x", "u1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("A manutenção programada desta tarefa está encerrada.");
    }
}
