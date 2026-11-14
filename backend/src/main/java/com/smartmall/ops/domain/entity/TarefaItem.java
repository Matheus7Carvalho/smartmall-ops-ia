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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Item do checklist da tarefa: cópia do item do modelo, mais a resposta. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TAREFA_ITEM")
public class TarefaItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TAREFA_ID", nullable = false)
    private Tarefa tarefa;

    @Column(name = "ORDEM", nullable = false)
    private Integer ordem;

    @Column(name = "PERGUNTA", nullable = false, length = 200)
    private String pergunta;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_RESPOSTA", nullable = false, length = 10)
    private TipoResposta tipoResposta;

    @Column(name = "OBRIGATORIO", nullable = false)
    private Boolean obrigatorio;

    @Column(name = "MAX_CARACTERES")
    private Integer maxCaracteres;

    /** SIM_NAO: "SIM"/"NAO"; NUMERO: número com ponto decimal; TEXTO: até maxCaracteres. */
    @Column(name = "RESPOSTA", length = 500)
    private String resposta;

    public static TarefaItem copiaDe(ChecklistItem modelo, Tarefa tarefa) {
        var item = new TarefaItem();
        item.tarefa = tarefa;
        item.ordem = modelo.getOrdem();
        item.pergunta = modelo.getPergunta();
        item.tipoResposta = modelo.getTipoResposta();
        item.obrigatorio = modelo.getObrigatorio();
        item.maxCaracteres = modelo.getMaxCaracteres();
        return item;
    }
}
