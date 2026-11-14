package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.TipoResposta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "CHECKLIST_ITEM")
public class ChecklistItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CHECKLIST_ID", nullable = false)
    private Checklist checklist;

    @Column(name = "ORDEM", nullable = false)
    private Integer ordem;

    @Column(name = "PERGUNTA", nullable = false, length = 200)
    private String pergunta;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_RESPOSTA", nullable = false, length = 10)
    private TipoResposta tipoResposta;

    @Column(name = "OBRIGATORIO", nullable = false)
    private Boolean obrigatorio;

    /** Só para TEXTO (1 a 500). Nulo nos demais tipos. */
    @Column(name = "MAX_CARACTERES")
    private Integer maxCaracteres;
}
