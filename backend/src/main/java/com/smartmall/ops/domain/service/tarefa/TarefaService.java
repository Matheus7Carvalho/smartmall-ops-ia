package com.smartmall.ops.domain.service.tarefa;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import com.smartmall.ops.domain.model.tarefa.FiltroTarefas;
import com.smartmall.ops.domain.model.tarefa.TarefaResponse;
import com.smartmall.ops.domain.model.tarefa.ResumoTarefasResponse;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TarefaService implements ITarefaService {

    /** Período máximo de uma consulta da agenda (um trimestre). */
    public static final int MAX_DIAS_CONSULTA = 93;

    private final TarefaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final Clock clock;

    public TarefaService(TarefaRepository repository, UsuarioRepository usuarioRepository, Clock clock) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.clock = clock;
    }

    @Override
    public List<TarefaResponse> agenda(FiltroTarefas filtro, String membroId) {
        if (filtro.getAte().isBefore(filtro.getDe())) {
            throw new DomainException("A data final não pode ser antes da inicial.");
        }
        if (ChronoUnit.DAYS.between(filtro.getDe(), filtro.getAte()) >= MAX_DIAS_CONSULTA) {
            throw new DomainException("Consulte no máximo %d dias por vez.", MAX_DIAS_CONSULTA);
        }
        var agora = LocalDateTime.now(clock);
        return repository.buscar(filtro.getDe().atStartOfDay(), filtro.getAte().plusDays(1).atStartOfDay(),
                        filtro.getManutencaoProgramadaId(), filtro.getEquipeId(), membroId).stream()
                .filter(m -> atende(m, filtro.getSituacao(), agora))
                .map(m -> TarefaResponse.de(m, agora))
                .toList();
    }

    private static boolean atende(Tarefa m, FiltroTarefas.Situacao situacao, LocalDateTime agora) {
        if (situacao == null) return true;
        return switch (situacao) {
            case ATRASADA -> m.isAtrasada(agora);
            case AGENDADA -> m.getStatus() == StatusTarefa.AGENDADA && !m.isAtrasada(agora);
            case EM_EXECUCAO -> m.getStatus() == StatusTarefa.EM_EXECUCAO;
            case EM_ANALISE -> m.getStatus() == StatusTarefa.EM_ANALISE;
            case CONCLUIDA -> m.getStatus() == StatusTarefa.CONCLUIDA;
            case CANCELADA -> m.getStatus() == StatusTarefa.CANCELADA;
        };
    }

    @Override
    public ResumoTarefasResponse resumo(String membroId) {
        var agora = LocalDateTime.now(clock);
        var hoje = LocalDate.now(clock);
        var inicioMes = hoje.withDayOfMonth(1);
        var fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());
        // Atrasadas: até um ano para trás.
        var janela = repository.buscar(hoje.minusYears(1).atStartOfDay(), fimMes.plusDays(8).atStartOfDay(), null, null, membroId);

        long atrasadas = janela.stream().filter(m -> m.isAtrasada(agora)).count();
        long proximos7 = janela.stream()
                .filter(m -> m.getStatus() == StatusTarefa.AGENDADA)
                .filter(m -> !m.getDataHoraPrevista().isBefore(agora) && m.getDataHoraPrevista().isBefore(agora.plusDays(7)))
                .count();
        long noMes = janela.stream()
                .filter(m -> m.getStatus() == StatusTarefa.AGENDADA)
                .filter(m -> !m.getDataHoraPrevista().toLocalDate().isBefore(inicioMes) && !m.getDataHoraPrevista().toLocalDate().isAfter(fimMes))
                .count();
        return new ResumoTarefasResponse(atrasadas, proximos7, noMes);
    }

    @Override
    @Transactional
    public TarefaResponse cancelar(String id, String usuarioId) {
        var m = buscar(id);
        var agora = LocalDateTime.now(clock);
        if (m.getStatus() != StatusTarefa.AGENDADA) {
            throw new DomainException("Só tarefas agendadas podem ser canceladas.");
        }
        m.mudarStatus(StatusTarefa.CANCELADA, AcaoTarefa.CANCELADA, usuarioRepository.getReferenceById(usuarioId), agora, null);
        return TarefaResponse.de(repository.save(m), agora);
    }

    @Override
    @Transactional
    public TarefaResponse restaurar(String id, String usuarioId) {
        var m = buscar(id);
        var agora = LocalDateTime.now(clock);
        if (m.getStatus() != StatusTarefa.CANCELADA) {
            throw new DomainException("Só tarefas canceladas podem ser restauradas.");
        }
        if (m.getDataHoraPrevista().isBefore(agora)) {
            throw new DomainException("Não é possível restaurar uma tarefa com data passada.");
        }
        if (m.getProgramada() != null && !Boolean.TRUE.equals(m.getProgramada().getAtivo())) {
            throw new DomainException("A manutenção programada desta tarefa está encerrada.");
        }
        m.mudarStatus(StatusTarefa.AGENDADA, AcaoTarefa.RESTAURADA, usuarioRepository.getReferenceById(usuarioId), agora, null);
        return TarefaResponse.de(repository.save(m), agora);
    }

    private Tarefa buscar(String id) {
        return repository.findById(id).orElseThrow(TarefaService::naoEncontrada);
    }

    static EntityNotFoundException naoEncontrada() {
        return new EntityNotFoundException("Tarefa não encontrada.");
    }
}
