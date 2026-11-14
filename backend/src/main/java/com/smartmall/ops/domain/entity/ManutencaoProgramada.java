package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Recorrência que gera tarefas de manutenção. Ver docs/modulo-manutencao.md. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "MANUTENCAO_PROGRAMADA")
public class ManutencaoProgramada extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "EQUIPAMENTO_ID", nullable = false)
    private Equipamento equipamento;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "CHECKLIST_ID", nullable = false)
    private Checklist checklist;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "EQUIPE_ID", nullable = false)
    private Equipe equipe;

    @Enumerated(EnumType.STRING)
    @Column(name = "FREQUENCIA", nullable = false, length = 10)
    private Frequencia frequencia;

    /** "A cada N" dias/semanas/meses. 1 em frequência única. */
    @Column(name = "INTERVALO", nullable = false)
    private Integer intervalo;

    @Column(name = "DATA_INICIO", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "HORARIO", nullable = false)
    private LocalTime horario;

    @Column(name = "DURACAO_MINUTOS", nullable = false)
    private Integer duracaoMinutos;

    @Column(name = "DATA_FIM")
    private LocalDate dataFim;

    @Column(name = "OBSERVACOES", length = 500)
    private String observacoes;

    @Column(name = "ATIVO", nullable = false)
    private Boolean ativo = Boolean.TRUE;

    /** Até onde as tarefas foram geradas. Nulo = nunca gerado (ex.: seed). */
    @Column(name = "GERADO_ATE")
    private LocalDateTime geradoAte;
}
