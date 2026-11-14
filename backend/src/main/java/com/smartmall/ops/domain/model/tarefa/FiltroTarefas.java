package com.smartmall.ops.domain.model.tarefa;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Parâmetros de consulta da agenda (query string). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FiltroTarefas {

    @NotNull(message = "Informe a data inicial.")
    private LocalDate de;

    /** Inclusive. */
    @NotNull(message = "Informe a data final.")
    private LocalDate ate;

    @Size(max = 36)
    private String manutencaoProgramadaId;

    @Size(max = 36)
    private String equipeId;

    /** Nulo = todas. AGENDADA exclui as atrasadas. */
    private Situacao situacao;

    public enum Situacao { AGENDADA, ATRASADA, EM_EXECUCAO, EM_ANALISE, CONCLUIDA, CANCELADA }
}
