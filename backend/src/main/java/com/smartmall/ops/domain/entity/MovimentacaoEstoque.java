package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
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

/**
 * Entrada ou retirada de um item. Imutável: é a rastreabilidade do item (quem, quando, quanto, para onde).
 * Correção se faz com a movimentação contrária, nunca editando ou apagando.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "MOVIMENTACAO_ESTOQUE")
public class MovimentacaoEstoque extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ITEM_ID", nullable = false)
    private ItemEstoque item;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO", nullable = false, length = 10)
    private TipoMovimentacao tipo;

    @Column(name = "QUANTIDADE", nullable = false)
    private Integer quantidade;

    /** Saldo do item logo depois desta movimentação. */
    @Column(name = "SALDO_APOS", nullable = false)
    private Integer saldoApos;

    @Column(name = "DATA_HORA", nullable = false)
    private LocalDateTime dataHora;

    /** Quem registrou. */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    /** Destino da retirada (opcional): o equipamento atendido. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EQUIPAMENTO_ID")
    private Equipamento equipamento;

    @Column(name = "OBSERVACAO", length = 200)
    private String observacao;
}
