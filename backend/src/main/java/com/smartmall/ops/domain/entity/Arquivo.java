package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Conteúdo binário de um anexo. Fica separado dos metadados para não ser carregado em listagens. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ARQUIVO")
public class Arquivo extends BaseEntity {

    @Column(name = "CONTEUDO", nullable = false)
    private byte[] conteudo;
}
