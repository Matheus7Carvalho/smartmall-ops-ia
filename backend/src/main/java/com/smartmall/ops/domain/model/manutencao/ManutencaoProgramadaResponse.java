package com.smartmall.ops.domain.model.manutencao;

import com.smartmall.ops.domain.core.model.Resumo;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManutencaoProgramadaResponse {
    private String id;
    private Resumo equipamento;
    private Resumo checklist;
    private Resumo equipe;
    private Frequencia frequencia;
    private Integer intervalo;
    private LocalDate dataInicio;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horario;
    private Integer duracaoMinutos;
    private LocalDate dataFim;
    private String observacoes;
    private Boolean ativo;
    /** Próxima tarefa agendada; preenchido na listagem. */
    private LocalDateTime proximaData;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
