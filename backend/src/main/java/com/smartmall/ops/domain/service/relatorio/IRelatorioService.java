package com.smartmall.ops.domain.service.relatorio;

import com.smartmall.ops.domain.model.relatorio.FiltroRelatorio;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse;

public interface IRelatorioService {

    RelatorioTarefasResponse tarefas(FiltroRelatorio filtro);
}
