package com.smartmall.ops.domain.service.manutencao;

import com.smartmall.ops.domain.core.service.IBaseService;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Map;

public interface IManutencaoProgramadaService extends IBaseService<ManutencaoProgramada> {

    /** Desativa a manutenção programada e cancela as tarefas futuras ainda agendadas. */
    /** @param usuarioId quem encerrou; registrado no histórico das tarefas canceladas. */
    ManutencaoProgramada encerrar(String id, String usuarioId);

    /** Gera as manutenções das manutenções programadas ativos até o horizonte. Rodado diariamente e na inicialização. */
    int estenderHorizonte();

    /** Próxima tarefa agendada de cada manutenção programada. */
    Map<String, LocalDateTime> proximasDatas(Collection<ManutencaoProgramada> programadas);
}
