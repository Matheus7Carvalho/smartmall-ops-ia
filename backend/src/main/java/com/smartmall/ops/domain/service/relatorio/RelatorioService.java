package com.smartmall.ops.domain.service.relatorio;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.model.relatorio.FiltroRelatorio;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse.Contagem;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse.PorEquipamento;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse.PorEquipe;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

@Service
public class RelatorioService implements IRelatorioService {

    /** Período máximo de um relatório (um ano, contando ano bissexto). */
    public static final int MAX_DIAS = 366;

    private final TarefaRepository tarefaRepository;
    private final Clock clock;

    public RelatorioService(TarefaRepository tarefaRepository, Clock clock) {
        this.tarefaRepository = tarefaRepository;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public RelatorioTarefasResponse tarefas(FiltroRelatorio filtro) {
        if (filtro.getAte().isBefore(filtro.getDe())) {
            throw new DomainException("A data final não pode ser antes da inicial.");
        }
        if (ChronoUnit.DAYS.between(filtro.getDe(), filtro.getAte()) >= MAX_DIAS) {
            throw new DomainException("Consulte no máximo %d dias por vez.", MAX_DIAS);
        }
        var agora = LocalDateTime.now(clock);
        var de = filtro.getDe().atStartOfDay();
        var ate = filtro.getAte().plusDays(1).atStartOfDay();

        var tarefas = tarefaRepository.buscar(de, ate, null, filtro.getEquipeId(), null);
        Set<String> reprovadas = new HashSet<>(tarefaRepository.idsComReprovacao(de, ate, filtro.getEquipeId()));

        var porEquipe = agrupar(tarefas, t -> t.getProgramada().getEquipe(), Equipe::getId).values().stream()
                .map(grupo -> {
                    var e = grupo.getFirst().getProgramada().getEquipe();
                    return new PorEquipe(e.getId(), e.getNome(), contar(grupo, agora, reprovadas));
                })
                .sorted(Comparator.comparing(PorEquipe::nome))
                .toList();

        var porEquipamento = agrupar(tarefas, t -> t.getProgramada().getEquipamento(), Equipamento::getId).values().stream()
                .map(grupo -> {
                    var e = grupo.getFirst().getProgramada().getEquipamento();
                    return new PorEquipamento(e.getId(), e.getCodigo(), e.getNome(), e.getCondicao(), contar(grupo, agora, reprovadas));
                })
                .sorted(Comparator.comparing(PorEquipamento::codigo))
                .toList();

        return new RelatorioTarefasResponse(filtro.getDe(), filtro.getAte(), contar(tarefas, agora, reprovadas), porEquipe, porEquipamento);
    }

    private static <K> LinkedHashMap<String, List<Tarefa>> agrupar(List<Tarefa> tarefas, Function<Tarefa, K> chave, Function<K, String> id) {
        var grupos = new LinkedHashMap<String, List<Tarefa>>();
        for (var t : tarefas) {
            grupos.computeIfAbsent(id.apply(chave.apply(t)), k -> new ArrayList<>()).add(t);
        }
        return grupos;
    }

    static Contagem contar(Collection<Tarefa> tarefas, LocalDateTime agora, Set<String> reprovadas) {
        long atrasadas = 0, agendadas = 0, emExecucao = 0, emAnalise = 0, concluidas = 0, canceladas = 0, comReprovacao = 0;
        for (var t : tarefas) {
            switch (t.getStatus()) {
                case AGENDADA -> {
                    if (t.isAtrasada(agora)) atrasadas++;
                    else agendadas++;
                }
                case EM_EXECUCAO -> emExecucao++;
                case EM_ANALISE -> emAnalise++;
                case CONCLUIDA -> concluidas++;
                case CANCELADA -> canceladas++;
            }
            if (reprovadas.contains(t.getId())) comReprovacao++;
        }
        long total = tarefas.size();
        return new Contagem(total, agendadas, atrasadas, emExecucao, emAnalise, concluidas, canceladas, comReprovacao,
                percentual(concluidas, total - canceladas));
    }

    /** Arredonda para o inteiro mais próximo; 0 quando não há base. */
    static int percentual(long parte, long base) {
        return base <= 0 ? 0 : (int) Math.round(parte * 100.0 / base);
    }
}
