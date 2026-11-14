package com.smartmall.ops.domain.service.central;

import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.model.central.ResumoCentralResponse;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

/** Indicadores da Central de Controle, calculados por contagem no banco (sem carregar registros). */
@Service
@Transactional(readOnly = true)
public class CentralService implements ICentralService {

    private final TarefaRepository tarefaRepository;
    private final EquipeRepository equipeRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final Clock clock;

    public CentralService(TarefaRepository tarefaRepository, EquipeRepository equipeRepository,
                          EquipamentoRepository equipamentoRepository, Clock clock) {
        this.tarefaRepository = tarefaRepository;
        this.equipeRepository = equipeRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.clock = clock;
    }

    @Override
    public ResumoCentralResponse resumo() {
        var agora = LocalDateTime.now(clock);

        long emExecucao = tarefaRepository.countByStatus(StatusTarefa.EM_EXECUCAO);
        long emAnalise = tarefaRepository.countByStatus(StatusTarefa.EM_ANALISE);
        var tarefas = new ResumoCentralResponse.Tarefas(emExecucao + emAnalise, emExecucao, emAnalise);

        var equipes = new ResumoCentralResponse.Equipes(
                tarefaRepository.contarEquipesComStatus(StatusTarefa.EM_EXECUCAO), equipeRepository.count());

        long totalEquipamentos = equipamentoRepository.count();
        long operando = equipamentoRepository.countByCondicao(CondicaoEquipamento.OPERANDO);
        var equipamentos = new ResumoCentralResponse.Equipamentos(totalEquipamentos, operando, percentual(operando, totalEquipamentos));

        long inoperantes = equipamentoRepository.countByCondicao(CondicaoEquipamento.INOPERANTE);
        long emAtencao = equipamentoRepository.countByCondicao(CondicaoEquipamento.ATENCAO);
        // Mesma janela do indicador "Atrasadas" da tela de Tarefas: até um ano para trás.
        long atrasadas = tarefaRepository.contarAtrasadas(agora.toLocalDate().minusYears(1).atStartOfDay(), agora);
        var alertas = new ResumoCentralResponse.Alertas(inoperantes + emAtencao + atrasadas, inoperantes, inoperantes, emAtencao, atrasadas);

        return new ResumoCentralResponse(tarefas, equipes, equipamentos, alertas);
    }

    /** Arredonda para o inteiro mais próximo; 0 quando não há equipamentos. */
    static int percentual(long parte, long total) {
        return total == 0 ? 0 : (int) Math.round(parte * 100.0 / total);
    }
}
