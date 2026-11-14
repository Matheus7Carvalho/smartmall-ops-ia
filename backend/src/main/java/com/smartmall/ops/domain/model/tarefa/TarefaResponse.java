package com.smartmall.ops.domain.model.tarefa;

import com.smartmall.ops.domain.core.model.Resumo;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import com.smartmall.ops.domain.entity.enums.OrigemTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarefaResponse {
    private String id;
    private OrigemTarefa origem;
    /** Manutenção programada que gerou a tarefa (origem MANUTENCAO_PROGRAMADA). */
    private String manutencaoProgramadaId;
    private String chamadoId;
    private LocalDateTime dataHoraPrevista;
    private Integer duracaoMinutos;
    private StatusTarefa status;
    /** Agendada com data e hora já passadas (calculado na consulta). */
    private boolean atrasada;
    private Frequencia frequencia;
    private Resumo equipamento;
    private String piso;
    private String localizacao;
    private Resumo checklist;
    private Resumo equipe;
    /** Membro da equipe que assumiu a tarefa. */
    private Resumo responsavel;
    private Integer envios;
    private LocalDateTime ultimoEnvio;

    public static TarefaResponse de(Tarefa tarefa, LocalDateTime agora) {
        var programada = tarefa.getProgramada();
        var equipamento = tarefa.equipamentoEfetivo();
        var checklist = tarefa.checklistEfetivo();
        var equipe = tarefa.equipeEfetiva();
        var piso = tarefa.getPiso() != null ? tarefa.getPiso() : equipamento == null ? null : equipamento.getPiso();
        return TarefaResponse.builder()
                .id(tarefa.getId())
                .origem(tarefa.getOrigem())
                .manutencaoProgramadaId(programada == null ? null : programada.getId())
                .chamadoId(tarefa.getPlanoAcao() == null ? null : tarefa.getPlanoAcao().getChamado().getId())
                .dataHoraPrevista(tarefa.getDataHoraPrevista())
                .duracaoMinutos(tarefa.duracaoEfetiva())
                .status(tarefa.getStatus())
                .atrasada(tarefa.isAtrasada(agora))
                .frequencia(programada == null ? null : programada.getFrequencia())
                .equipamento(equipamento == null ? null : new Resumo(equipamento.getId(), equipamento.getNome(), equipamento.getCodigo()))
                .piso(piso == null ? null : piso.getNome())
                .localizacao(tarefa.getLocalizacao() == null ? equipamento == null ? null : equipamento.getLocalizacao() : tarefa.getLocalizacao())
                .checklist(checklist == null ? null : new Resumo(checklist.getId(), checklist.getNome(), null))
                .equipe(new Resumo(equipe.getId(), equipe.getNome(), null))
                .responsavel(TarefaDetalheResponse.resumo(tarefa.getResponsavel()))
                .envios(tarefa.getEnvios())
                .ultimoEnvio(tarefa.getUltimoEnvio())
                .build();
    }
}
