package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Entity @Table(name = "LOCAL_QR")
public class LocalQr extends BaseEntity {
    @Column(name = "CODIGO", nullable = false, length = 60, unique = true)
    private String codigo;
    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "PISO_ID", nullable = false)
    private Piso piso;
    @Column(name = "ATIVO", nullable = false)
    private Boolean ativo;
}
