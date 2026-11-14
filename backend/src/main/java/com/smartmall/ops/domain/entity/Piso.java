package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "PISO")
public class Piso extends BaseEntity {

    @Column(name = "CODIGO", nullable = false, length = 10)
    private String codigo;

    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;

    @Column(name = "ORDEM", nullable = false)
    private Integer ordem;
}
