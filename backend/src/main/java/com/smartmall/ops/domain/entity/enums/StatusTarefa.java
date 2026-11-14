package com.smartmall.ops.domain.entity.enums;

/**
 * AGENDADA → EM_EXECUCAO (assumida) → EM_ANALISE (enviada) → CONCLUIDA (aprovada).
 * Reprovada volta para EM_EXECUCAO com o mesmo responsável. "Atrasada" é calculado, não gravado.
 */
public enum StatusTarefa {
    AGENDADA,
    EM_EXECUCAO,
    EM_ANALISE,
    CONCLUIDA,
    CANCELADA
}
