package com.smartmall.ops.domain.model.relatorio;

import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;

import java.time.LocalDate;
import java.util.List;

/**
 * Relatório de tarefas previstas no período: totais, por equipe e por equipamento.
 * Só dados operacionais agregados; nenhum dado pessoal (LGPD).
 */
public record RelatorioTarefasResponse(
        LocalDate de,
        LocalDate ate,
        Contagem totais,
        List<PorEquipe> porEquipe,
        List<PorEquipamento> porEquipamento) {

    /**
     * @param total            tarefas previstas no período, inclusive canceladas
     * @param agendadas        agendadas ainda no prazo
     * @param atrasadas        agendadas com horário já passado
     * @param comReprovacao    reprovadas ao menos uma vez na análise (retrabalho)
     * @param taxaConclusao    concluídas / (total − canceladas), inteiro de 0 a 100
     */
    public record Contagem(long total, long agendadas, long atrasadas, long emExecucao, long emAnalise,
                           long concluidas, long canceladas, long comReprovacao, int taxaConclusao) {
    }

    public record PorEquipe(String id, String nome, Contagem contagem) {
    }

    public record PorEquipamento(String id, String codigo, String nome, CondicaoEquipamento condicao, Contagem contagem) {
    }
}
