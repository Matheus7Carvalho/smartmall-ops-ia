package com.smartmall.ops.domain.service.central;

import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CentralServiceTest {

    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);

    @Mock private TarefaRepository tarefaRepository;
    @Mock private EquipeRepository equipeRepository;
    @Mock private EquipamentoRepository equipamentoRepository;

    private CentralService service;

    @BeforeEach
    void setUp() {
        service = new CentralService(tarefaRepository, equipeRepository, equipamentoRepository,
                Clock.fixed(AGORA.atZone(FUSO).toInstant(), FUSO));
    }

    private void contagens(long emExecucao, long emAnalise, long equipesAtivas, long equipes,
                           long equipamentos, long operando, long atencao, long inoperantes, long atrasadas) {
        when(tarefaRepository.countByStatus(StatusTarefa.EM_EXECUCAO)).thenReturn(emExecucao);
        when(tarefaRepository.countByStatus(StatusTarefa.EM_ANALISE)).thenReturn(emAnalise);
        when(tarefaRepository.contarEquipesComStatus(StatusTarefa.EM_EXECUCAO)).thenReturn(equipesAtivas);
        when(equipeRepository.count()).thenReturn(equipes);
        when(equipamentoRepository.count()).thenReturn(equipamentos);
        when(equipamentoRepository.countByCondicao(CondicaoEquipamento.OPERANDO)).thenReturn(operando);
        when(equipamentoRepository.countByCondicao(CondicaoEquipamento.ATENCAO)).thenReturn(atencao);
        when(equipamentoRepository.countByCondicao(CondicaoEquipamento.INOPERANTE)).thenReturn(inoperantes);
        when(tarefaRepository.contarAtrasadas(AGORA.toLocalDate().minusYears(1).atStartOfDay(), AGORA)).thenReturn(atrasadas);
    }

    @Test
    void tarefasAtivasSomamEmExecucaoEEmAnalise() {
        contagens(3, 2, 2, 5, 10, 8, 1, 1, 4);

        var tarefas = service.resumo().getTarefas();

        assertThat(tarefas.getAtivas()).isEqualTo(5);
        assertThat(tarefas.getEmExecucao()).isEqualTo(3);
        assertThat(tarefas.getEmAnalise()).isEqualTo(2);
    }

    @Test
    void equipesEmOperacaoSaoAsComTarefaEmExecucao() {
        contagens(3, 0, 2, 5, 10, 8, 1, 1, 0);

        var equipes = service.resumo().getEquipes();

        assertThat(equipes.getEmOperacao()).isEqualTo(2);
        assertThat(equipes.getTotal()).isEqualTo(5);
        verify(tarefaRepository).contarEquipesComStatus(StatusTarefa.EM_EXECUCAO);
    }

    @Test
    void equipamentosMostramTotalOperandoEPercentualArredondado() {
        contagens(0, 0, 0, 0, 3, 2, 1, 0, 0);

        var equipamentos = service.resumo().getEquipamentos();

        assertThat(equipamentos.getTotal()).isEqualTo(3);
        assertThat(equipamentos.getOperando()).isEqualTo(2);
        assertThat(equipamentos.getPercentualOperando()).isEqualTo(67);
    }

    @Test
    void semEquipamentosOPercentualEhZero() {
        contagens(0, 0, 0, 0, 0, 0, 0, 0, 0);

        assertThat(service.resumo().getEquipamentos().getPercentualOperando()).isZero();
    }

    @Test
    void alertasSomamInoperantesEmAtencaoEAtrasadasEUrgentesSaoOsInoperantes() {
        contagens(0, 0, 0, 0, 10, 6, 3, 1, 4);

        var alertas = service.resumo().getAlertas();

        assertThat(alertas.getTotal()).isEqualTo(8);
        assertThat(alertas.getUrgentes()).isEqualTo(1);
        assertThat(alertas.getEquipamentosInoperantes()).isEqualTo(1);
        assertThat(alertas.getEquipamentosEmAtencao()).isEqualTo(3);
        assertThat(alertas.getTarefasAtrasadas()).isEqualTo(4);
    }

    @Test
    void percentualArredondaParaOInteiroMaisProximo() {
        assertThat(CentralService.percentual(1, 3)).isEqualTo(33);
        assertThat(CentralService.percentual(5, 5)).isEqualTo(100);
        assertThat(CentralService.percentual(1, 8)).isEqualTo(13);
    }
}
