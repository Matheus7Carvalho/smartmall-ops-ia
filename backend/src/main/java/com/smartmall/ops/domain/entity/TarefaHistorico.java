package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
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

import java.time.LocalDateTime;

/** RNF06: registro de cada mudança de status da tarefa. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TAREFA_HISTORICO")
public class TarefaHistorico extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TAREFA_ID", nullable = false)
    private Tarefa tarefa;

    @Enumerated(EnumType.STRING)
    @Column(name = "ACAO", nullable = false, length = 20)
    private AcaoTarefa acao;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    @Column(name = "DATA_HORA", nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS_RESULTANTE", nullable = false, length = 12)
    private StatusTarefa statusResultante;

    /** Observação do envio ou da aprovação, ou motivo da reprovação. */
    @Column(name = "OBSERVACAO", length = 500)
    private String observacao;

    /** Número do envio (ação ENVIADA), que liga o registro às evidências. */
    @Column(name = "ENVIO")
    private Integer envio;
}
