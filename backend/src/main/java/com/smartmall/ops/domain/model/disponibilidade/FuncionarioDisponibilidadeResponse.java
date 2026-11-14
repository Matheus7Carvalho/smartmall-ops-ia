package com.smartmall.ops.domain.model.disponibilidade;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Situação de um funcionário hoje. LGPD: só nome e vínculos operacionais; sem e-mail ou outros dados pessoais.
 *
 * @param ausencia    a vigente; sem ela, a próxima agendada (ou nula)
 * @param tarefaAtual a tarefa em execução mais antiga de que é responsável (ou nula)
 */
public record FuncionarioDisponibilidadeResponse(
        String id,
        String nome,
        List<Resumo> equipes,
        SituacaoFuncionario situacao,
        TarefaAtual tarefaAtual,
        int tarefasEmExecucao,
        AusenciaResponse ausencia) {

    public record Resumo(String id, String nome) {
    }

    public record TarefaAtual(String id, String equipamento, String equipe, LocalDateTime dataHoraPrevista) {
    }
}
