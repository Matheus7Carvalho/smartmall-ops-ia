package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.MotivoAusencia;
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

/** Período (dias inteiros, inclusive) em que o funcionário não está disponível para tarefas. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "AUSENCIA")
public class Ausencia extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    private Usuario usuario;

    @Column(name = "INICIO", nullable = false)
    private LocalDate inicio;

    @Column(name = "FIM", nullable = false)
    private LocalDate fim;

    @Enumerated(EnumType.STRING)
    @Column(name = "MOTIVO", nullable = false, length = 15)
    private MotivoAusencia motivo;

    /** Gestor que registrou. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "REGISTRADA_POR_ID", nullable = false)
    private Usuario registradaPor;

    public boolean vigenteEm(LocalDate dia) {
        return !inicio.isAfter(dia) && !fim.isBefore(dia);
    }
}
