package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Imagem anexada pelo responsável como evidência da execução. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TAREFA_EVIDENCIA")
public class TarefaEvidencia extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TAREFA_ID", nullable = false)
    private Tarefa tarefa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false, cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    @JoinColumn(name = "ARQUIVO_ID", nullable = false)
    private Arquivo arquivo;

    @Column(name = "NOME_ARQUIVO", nullable = false, length = 150)
    private String nomeArquivo;

    @Column(name = "TIPO_CONTEUDO", nullable = false, length = 30)
    private String tipoConteudo;

    @Column(name = "TAMANHO_BYTES", nullable = false)
    private Integer tamanhoBytes;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ENVIADA_POR_ID", nullable = false)
    private Usuario enviadaPor;

    /** Envio para análise que levou a evidência. Nulo = ainda não enviada (pode ser removida). */
    @Column(name = "ENVIO")
    private Integer envio;
}
