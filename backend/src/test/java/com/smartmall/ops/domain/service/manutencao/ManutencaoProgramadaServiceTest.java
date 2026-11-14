package com.smartmall.ops.domain.service.manutencao;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.repository.checklist.ChecklistRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ManutencaoProgramadaServiceTest {

    /** "Agora" fixo: sábado, 14/11/2026, 10:00. */
    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);
    private static final LocalDate HOJE = AGORA.toLocalDate();

    @Mock private ManutencaoProgramadaRepository repository;
    @Mock private EquipamentoRepository equipamentoRepository;
    @Mock private ChecklistRepository checklistRepository;
    @Mock private EquipeRepository equipeRepository;
    @Mock private TarefaRepository tarefaRepository;
    @Mock private UsuarioRepository usuarioRepository;

    private ManutencaoProgramadaService service;
    private final List<Tarefa> salvas = new ArrayList<>();

    @BeforeEach
    void setUp() {
        var clock = Clock.fixed(AGORA.atZone(FUSO).toInstant(), FUSO);
        service = new ManutencaoProgramadaService(repository, equipamentoRepository, checklistRepository, equipeRepository, tarefaRepository, usuarioRepository, clock);
        lenient().when(repository.save(any())).thenAnswer(inv -> {
            ManutencaoProgramada p = inv.getArgument(0);
            if (p.getId() == null) p.setId("programada-1");
            return p;
        });
        lenient().when(tarefaRepository.save(any())).thenAnswer(inv -> {
            salvas.add(inv.getArgument(0));
            return inv.getArgument(0);
        });
        lenient().when(equipamentoRepository.findById("eq")).thenReturn(Optional.of(com(new Equipamento(), "eq")));
        lenient().when(checklistRepository.findById("ck")).thenReturn(Optional.of(com(new Checklist(), "ck")));
        lenient().when(equipeRepository.findById("tm")).thenReturn(Optional.of(com(new Equipe(), "tm")));
    }

    private static <T extends com.smartmall.ops.domain.core.entity.BaseEntity> T com(T entidade, String id) {
        entidade.setId(id);
        return entidade;
    }

    private static ManutencaoProgramada programada(Frequencia frequencia, int intervalo, LocalDate inicio, LocalTime horario) {
        var p = new ManutencaoProgramada();
        p.setEquipamento(com(new Equipamento(), "eq"));
        p.setChecklist(com(new Checklist(), "ck"));
        p.setEquipe(com(new Equipe(), "tm"));
        p.setFrequencia(frequencia);
        p.setIntervalo(intervalo);
        p.setDataInicio(inicio);
        p.setHorario(horario);
        p.setDuracaoMinutos(60);
        return p;
    }

    // ---- criação

    @Test
    void criaPlanoSemanalEGeraAsDatasDoHorizonte() {
        var criado = service.create(programada(Frequencia.SEMANAL, 1, HOJE.plusDays(2), LocalTime.of(8, 0)));

        assertThat(criado.getAtivo()).isTrue();
        // Horizonte: 14/11 + 120 dias = 14/03/2027. Segundas de 16/11 a 08/03: 17.
        assertThat(salvas).hasSize(17);
        assertThat(salvas.getLast().getDataHoraPrevista()).isEqualTo(LocalDateTime.of(2027, 3, 8, 8, 0));
        assertThat(salvas.getFirst().getDataHoraPrevista()).isEqualTo(LocalDateTime.of(2026, 11, 16, 8, 0));
        assertThat(salvas).allSatisfy(m -> assertThat(m.getStatus()).isEqualTo(StatusTarefa.AGENDADA));
        assertThat(criado.getGeradoAte()).isEqualTo(HOJE.plusDays(ManutencaoProgramadaService.HORIZONTE_DIAS).atTime(23, 59, 59));
    }

    @Test
    void unicaGeraUmaManutencaoEIgnoraIntervaloETermino() {
        var p = programada(Frequencia.UNICA, 5, HOJE.plusDays(1), LocalTime.of(9, 0));
        p.setDataFim(HOJE.plusDays(30));

        var criado = service.create(p);

        assertThat(criado.getIntervalo()).isEqualTo(1);
        assertThat(criado.getDataFim()).isNull();
        assertThat(salvas).extracting(Tarefa::getDataHoraPrevista).containsExactly(LocalDateTime.of(2026, 11, 15, 9, 0));
    }

    @Test
    void inicioNoPassadoEhRecusado() {
        assertThatThrownBy(() -> service.create(programada(Frequencia.SEMANAL, 1, HOJE.minusDays(1), LocalTime.of(8, 0))))
                .isInstanceOf(DomainException.class)
                .hasMessage("O início (data e horário) precisa ser no futuro.");
        verify(repository, never()).save(any());
    }

    @Test
    void inicioHojeComHorarioJaPassadoEhRecusado() {
        assertThatThrownBy(() -> service.create(programada(Frequencia.DIARIA, 1, HOJE, LocalTime.of(9, 0))))
                .isInstanceOf(DomainException.class)
                .hasMessage("O início (data e horário) precisa ser no futuro.");
    }

    @Test
    void inicioHojeMaisTardeEhAceito() {
        service.create(programada(Frequencia.UNICA, 1, HOJE, LocalTime.of(15, 0)));

        assertThat(salvas).extracting(Tarefa::getDataHoraPrevista).containsExactly(LocalDateTime.of(2026, 11, 14, 15, 0));
    }

    @Test
    void terminoAntesDoInicioEhRecusado() {
        var p = programada(Frequencia.DIARIA, 1, HOJE.plusDays(5), LocalTime.of(8, 0));
        p.setDataFim(HOJE.plusDays(4));

        assertThatThrownBy(() -> service.create(p))
                .isInstanceOf(DomainException.class)
                .hasMessage("A data de término não pode ser antes do início.");
    }

    @Test
    void equipamentoInexistenteEhRecusado() {
        var p = programada(Frequencia.DIARIA, 1, HOJE.plusDays(1), LocalTime.of(8, 0));
        p.setEquipamento(com(new Equipamento(), "nao-existe"));
        when(equipamentoRepository.findById("nao-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(p))
                .isInstanceOf(DomainException.class)
                .hasMessage("Equipamento não encontrado.");
    }

    @Test
    void observacoesEmBrancoViramNulas() {
        var p = programada(Frequencia.UNICA, 1, HOJE.plusDays(1), LocalTime.of(8, 0));
        p.setObservacoes("   ");

        assertThat(service.create(p).getObservacoes()).isNull();
    }

    // ---- edição

    private ManutencaoProgramada existente() {
        var p = programada(Frequencia.SEMANAL, 1, LocalDate.of(2026, 11, 2), LocalTime.of(8, 0)); // segundas
        p.setId("programada-1");
        p.setAtivo(true);
        when(repository.findById("programada-1")).thenReturn(Optional.of(p));
        return p;
    }

    private static Tarefa tarefa(ManutencaoProgramada p, LocalDateTime dataHora, StatusTarefa status) {
        var m = new Tarefa(p, dataHora);
        m.setStatus(status);
        return m;
    }

    @Test
    void edicaoRefazSoAsDatasFuturasPreservandoCancelamentosQueContinuam() {
        var p = existente();
        var seg16 = tarefa(p, LocalDateTime.of(2026, 11, 16, 8, 0), StatusTarefa.CANCELADA);
        var seg23 = tarefa(p, LocalDateTime.of(2026, 11, 23, 8, 0), StatusTarefa.AGENDADA);
        when(tarefaRepository.findByProgramadaIdAndDataHoraPrevistaGreaterThanEqual(eq("programada-1"), any())).thenReturn(List.of(seg16, seg23));

        // Passa a ser a cada 2 semanas a partir da mesma data (02/11): 16/11 continua, 23/11 sai, 30/11 entra.
        service.update(programada(Frequencia.SEMANAL, 2, LocalDate.of(2026, 11, 2), LocalTime.of(8, 0)), "programada-1");

        verify(tarefaRepository, never()).delete(seg16);
        assertThat(seg16.getStatus()).isEqualTo(StatusTarefa.CANCELADA);
        verify(tarefaRepository).delete(seg23);
        assertThat(salvas).extracting(Tarefa::getDataHoraPrevista)
                .contains(LocalDateTime.of(2026, 11, 30, 8, 0))
                .doesNotContain(LocalDateTime.of(2026, 11, 16, 8, 0), LocalDateTime.of(2026, 11, 23, 8, 0));
    }

    @Test
    void edicaoMantendoInicioPassadoEhPermitida() {
        existente();
        when(tarefaRepository.findByProgramadaIdAndDataHoraPrevistaGreaterThanEqual(eq("programada-1"), any())).thenReturn(List.of());

        var salvo = service.update(programada(Frequencia.SEMANAL, 1, LocalDate.of(2026, 11, 2), LocalTime.of(9, 0)), "programada-1");

        assertThat(salvo.getHorario()).isEqualTo(LocalTime.of(9, 0));
    }

    @Test
    void edicaoMudandoInicioParaOPassadoEhRecusada() {
        existente();

        assertThatThrownBy(() -> service.update(programada(Frequencia.SEMANAL, 1, LocalDate.of(2026, 11, 1), LocalTime.of(8, 0)), "programada-1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("O início (data e horário) precisa ser no futuro.");
    }

    @Test
    void planoEncerradoNaoPodeSerEditado() {
        existente().setAtivo(false);

        assertThatThrownBy(() -> service.update(programada(Frequencia.SEMANAL, 1, LocalDate.of(2026, 11, 2), LocalTime.of(8, 0)), "programada-1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Manutenção programada encerrada não pode ser editada.");
    }

    // ---- encerrar, excluir, horizonte

    @Test
    void encerrarCancelaSoAsFuturasAgendadas() {
        var p = existente();
        var agendada = tarefa(p, LocalDateTime.of(2026, 11, 16, 8, 0), StatusTarefa.AGENDADA);
        var cancelada = tarefa(p, LocalDateTime.of(2026, 11, 23, 8, 0), StatusTarefa.CANCELADA);
        when(tarefaRepository.findByProgramadaIdAndDataHoraPrevistaGreaterThanEqual("programada-1", AGORA)).thenReturn(List.of(agendada, cancelada));

        var encerrado = service.encerrar("programada-1", "u1");

        assertThat(encerrado.getAtivo()).isFalse();
        assertThat(agendada.getStatus()).isEqualTo(StatusTarefa.CANCELADA);
        assertThat(cancelada.getStatus()).isEqualTo(StatusTarefa.CANCELADA);
    }

    @Test
    void excluirPlanoSemExecucaoApagaAsManutencoes() {
        existente();
        when(tarefaRepository.existsByProgramadaIdAndStatusNotIn(eq("programada-1"), any())).thenReturn(false);

        service.delete("programada-1");

        verify(tarefaRepository).excluirDaProgramada("programada-1");
        verify(repository).deleteById("programada-1");
    }

    @Test
    void excluirPlanoComExecucaoEhRecusado() {
        existente();
        when(tarefaRepository.existsByProgramadaIdAndStatusNotIn(eq("programada-1"), any())).thenReturn(true);

        assertThatThrownBy(() -> service.delete("programada-1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Manutenção programada com tarefa executada não pode ser excluída. Encerre-a.");
        verify(repository, never()).deleteById(anyString());
    }

    @Test
    void horizonteContinuaDeOndeParou() {
        var p = programada(Frequencia.DIARIA, 1, LocalDate.of(2026, 11, 1), LocalTime.of(8, 0));
        p.setId("programada-1");
        p.setGeradoAte(LocalDate.of(2027, 3, 10).atTime(23, 59, 59));
        when(repository.findByAtivoTrue()).thenReturn(List.of(p));

        int criadas = service.estenderHorizonte();

        // Horizonte: 14/11/2026 + 120 dias = 14/03/2027. Faltam 11, 12, 13 e 14/03.
        assertThat(criadas).isEqualTo(4);
        assertThat(salvas.getFirst().getDataHoraPrevista()).isEqualTo(LocalDateTime.of(2027, 3, 11, 8, 0));
    }

    @Test
    void planoNuncaGeradoGeraDesdeOInicioIncluindoAtrasadas() {
        var p = programada(Frequencia.SEMANAL, 1, LocalDate.of(2026, 11, 2), LocalTime.of(8, 0));
        p.setId("programada-1");
        when(repository.findByAtivoTrue()).thenReturn(List.of(p));

        service.estenderHorizonte();

        assertThat(salvas.getFirst().getDataHoraPrevista()).isEqualTo(LocalDateTime.of(2026, 11, 2, 8, 0));
        assertThat(salvas.getFirst().isAtrasada(AGORA)).isTrue();
    }

    @Test
    void naoDuplicaDatasJaExistentes() {
        var p = programada(Frequencia.DIARIA, 1, LocalDate.of(2026, 11, 15), LocalTime.of(8, 0));
        p.setId("programada-1");
        p.setDataFim(LocalDate.of(2026, 11, 17));
        when(repository.findByAtivoTrue()).thenReturn(List.of(p));
        when(tarefaRepository.findByProgramadaIdAndDataHoraPrevistaBetween(eq("programada-1"), any(), any()))
                .thenReturn(List.of(tarefa(p, LocalDateTime.of(2026, 11, 16, 8, 0), StatusTarefa.AGENDADA)));

        int criadas = service.estenderHorizonte();

        assertThat(criadas).isEqualTo(2);
        var captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository, atLeastOnce()).save(captor.capture());
        assertThat(captor.getAllValues()).extracting(Tarefa::getDataHoraPrevista)
                .containsExactly(LocalDateTime.of(2026, 11, 15, 8, 0), LocalDateTime.of(2026, 11, 17, 8, 0));
    }
}
