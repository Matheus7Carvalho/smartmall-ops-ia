package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Entity @Table(name = "CHAMADO_MIDIA")
public class ChamadoMidia extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CHAMADO_ID", nullable = false, unique = true)
    private Chamado chamado;
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "ARQUIVO_ID", nullable = false)
    private Arquivo arquivo;
    @Column(name = "NOME", nullable = false, length = 150)
    private String nome;
    @Column(name = "TIPO", nullable = false, length = 30)
    private String tipo;
    @Column(name = "TAMANHO_BYTES", nullable = false)
    private Integer tamanhoBytes;
}
