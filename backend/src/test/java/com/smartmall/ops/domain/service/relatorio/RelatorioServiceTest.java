package com.smartmall.ops.domain.service.relatorio;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.model.relatorio.FiltroRelatorio;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
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
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);
    private static final LocalDate DE = LocalDate.of(2026, 11, 1);
    private static final LocalDate ATE = LocalDate.of(2026, 11, 30);

    @Mock private TarefaRepository repository;

    private RelatorioService service;
    private ManutencaoProgramada elevador;
    private ManutencaoProgramada bomba;

    @BeforeEach
    void setUp() {
        service = new RelatorioService(repository, Clock.fixed(AGORA.atZone(FUSO).toInstant(), FUSO));
        var piso = new Piso("L1", "Piso L1", 1);
        var elevadores = new Equipe("Elevadores", List.of());
        elevadores.setId("eq-elev");
        var hidraulica = new Equipe("Hidráulica", List.of());
        hidraulica.setId("eq-hid");
        elevador = programada(new Equipamento("ELV-E1", "Elevador E1", null, piso, "Praça", CondicaoEquipamento.OPERANDO), "e-elv", elevadores);
        bomba = programada(new Equipamento("BOM-B01", "Bomba B01", null, piso, "Casa de bombas", CondicaoEquipamento.ATENCAO), "e-bom", hidraulica);
    }

    private static ManutencaoProgramada programada(Equipamento equipamento, String id, Equipe equipe) {
        equipamento.setId(id);
        var p = new ManutencaoProgramada();
        p.setEquipamento(equipamento);
        p.setEquipe(equipe);
        return p;
    }

    private static Tarefa tarefa(String id, ManutencaoProgramada p, LocalDateTime quando, StatusTarefa status) {
        var t = new Tarefa(p, quando);
        t.setId(id);
        t.setStatus(status);
        return t;
    }

    private static FiltroRelatorio filtro(LocalDate de, LocalDate ate) {
        return FiltroRelatorio.builder().de(de).ate(ate).build();
    }

    private void cenario() {
        when(repository.buscar(DE.atStartOfDay(), ATE.plusDays(1).atStartOfDay(), null, null, null)).thenReturn(List.of(
                tarefa("t1", elevador, AGORA.minusDays(2), StatusTarefa.CONCLUIDA),
                tarefa("t2", elevador, AGORA.minusDays(1), StatusTarefa.AGENDADA),   // atrasada
                tarefa("t3", elevador, AGORA.plusDays(1), StatusTarefa.AGENDADA),
                tarefa("t4", elevador, AGORA.plusDays(2), StatusTarefa.CANCELADA),
                tarefa("t5", bomba, AGORA.minusHours(1), StatusTarefa.EM_EXECUCAO),
                tarefa("t6", bomba, AGORA.minusDays(3), StatusTarefa.EM_ANALISE),
                tarefa("t7", bomba, AGORA.minusDays(4), StatusTarefa.CONCLUIDA)));
        when(repository.idsComReprovacao(DE.atStartOfDay(), ATE.plusDays(1).atStartOfDay(), null)).thenReturn(List.of("t6", "t7"));
    }

    @Test
    void totaisContamCadaSituacaoEATaxaIgnoraCanceladas() {
        cenario();

        var totais = service.tarefas(filtro(DE, ATE)).totais();

        assertThat(totais.total()).isEqualTo(7);
        assertThat(totais.concluidas()).isEqualTo(2);
        assertThat(totais.atrasadas()).isEqualTo(1);
        assertThat(totais.agendadas()).isEqualTo(1);
        assertThat(totais.emExecucao()).isEqualTo(1);
        assertThat(totais.emAnalise()).isEqualTo(1);
        assertThat(totais.canceladas()).isEqualTo(1);
        assertThat(totais.comReprovacao()).isEqualTo(2);
        // 2 concluídas de 6 não canceladas.
        assertThat(totais.taxaConclusao()).isEqualTo(33);
    }

    @Test
    void agrupaPorEquipeEmOrdemDeNome() {
        cenario();

        var porEquipe = service.tarefas(filtro(DE, ATE)).porEquipe();

        assertThat(porEquipe).extracting(e -> e.nome()).containsExactly("Elevadores", "Hidráulica");
        var elevadores = porEquipe.getFirst().contagem();
        assertThat(elevadores.total()).isEqualTo(4);
        assertThat(elevadores.taxaConclusao()).isEqualTo(33);
        var hidraulica = porEquipe.get(1).contagem();
        assertThat(hidraulica.comReprovacao()).isEqualTo(2);
        assertThat(hidraulica.taxaConclusao()).isEqualTo(33);
    }

    @Test
    void agrupaPorEquipamentoComCondicaoEmOrdemDeCodigo() {
        cenario();

        var porEquipamento = service.tarefas(filtro(DE, ATE)).porEquipamento();

        assertThat(porEquipamento).extracting(e -> e.codigo()).containsExactly("BOM-B01", "ELV-E1");
        assertThat(porEquipamento.getFirst().condicao()).isEqualTo(CondicaoEquipamento.ATENCAO);
        assertThat(porEquipamento.getFirst().contagem().total()).isEqualTo(3);
    }

    @Test
    void semTarefasRetornaZerosSemDividirPorZero() {
        when(repository.buscar(any(), any(), any(), any(), any())).thenReturn(List.of());
        when(repository.idsComReprovacao(any(), any(), any())).thenReturn(List.of());

        var r = service.tarefas(filtro(DE, ATE));

        assertThat(r.totais().total()).isZero();
        assertThat(r.totais().taxaConclusao()).isZero();
        assertThat(r.porEquipe()).isEmpty();
        assertThat(r.porEquipamento()).isEmpty();
    }

    @Test
    void repassaAEquipeDoFiltro() {
        when(repository.buscar(any(), any(), any(), any(), any())).thenReturn(List.of());
        when(repository.idsComReprovacao(any(), any(), any())).thenReturn(List.of());

        service.tarefas(FiltroRelatorio.builder().de(DE).ate(ATE).equipeId("eq-hid").build());

        verify(repository).buscar(DE.atStartOfDay(), ATE.plusDays(1).atStartOfDay(), null, "eq-hid", null);
        verify(repository).idsComReprovacao(DE.atStartOfDay(), ATE.plusDays(1).atStartOfDay(), "eq-hid");
    }

    @Test
    void rejeitaFimAntesDoInicio() {
        assertThatThrownBy(() -> service.tarefas(filtro(ATE, DE)))
                .isInstanceOf(DomainException.class).hasMessage("A data final não pode ser antes da inicial.");
        verifyNoInteractions(repository);
    }

    @Test
    void rejeitaPeriodoMaiorQueUmAno() {
        assertThatThrownBy(() -> service.tarefas(filtro(DE, DE.plusDays(RelatorioService.MAX_DIAS))))
                .isInstanceOf(DomainException.class).hasMessage("Consulte no máximo 366 dias por vez.");
        verifyNoInteractions(repository);
    }

    @Test
    void contagemDeTarefaAvulsa() {
        var c = RelatorioService.contar(List.of(tarefa("x", bomba, AGORA.minusMinutes(1), StatusTarefa.AGENDADA)), AGORA, Set.of());

        assertThat(c.atrasadas()).isEqualTo(1);
        assertThat(c.agendadas()).isZero();
    }
}
