package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.CategoriaEquipamento;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
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
@Table(name = "EQUIPAMENTO")
public class Equipamento extends BaseEntity {

    @Column(name = "CODIGO", nullable = false, length = 20)
    private String codigo;

    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORIA", nullable = false, length = 20)
    private CategoriaEquipamento categoria;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "PISO_ID", nullable = false)
    private Piso piso;

    @Column(name = "LOCALIZACAO", nullable = false, length = 150)
    private String localizacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "CONDICAO", nullable = false, length = 12)
    private CondicaoEquipamento condicao;
}
