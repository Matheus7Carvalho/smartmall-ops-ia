package com.smartmall.ops.domain.model.tarefa;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Indicadores da agenda. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumoTarefasResponse {
    private long atrasadas;
    private long proximos7Dias;
    private long agendadasNoMes;
}
