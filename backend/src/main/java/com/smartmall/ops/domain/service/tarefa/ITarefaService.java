package com.smartmall.ops.domain.service.tarefa;

import com.smartmall.ops.domain.model.tarefa.FiltroTarefas;
import com.smartmall.ops.domain.model.tarefa.TarefaResponse;
import com.smartmall.ops.domain.model.tarefa.ResumoTarefasResponse;

import java.util.List;

public interface ITarefaService {

    /**
     * Tarefas do período.
     * @param membroId quando informado, só as das equipes de que o usuário é membro (visão do Funcionário).
     */
    List<TarefaResponse> agenda(FiltroTarefas filtro, String membroId);

    ResumoTarefasResponse resumo(String membroId);

    TarefaResponse cancelar(String id, String usuarioId);

    TarefaResponse restaurar(String id, String usuarioId);
}
