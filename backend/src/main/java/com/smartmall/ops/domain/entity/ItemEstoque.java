package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.CategoriaItemEstoque;
import com.smartmall.ops.domain.entity.enums.UnidadeMedida;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Item do almoxarifado (peça, ferramenta, consumível, EPI). Não confundir com Equipamento, que é o ativo
 * monitorado do shopping. O saldo só muda por movimentação (entrada ou retirada), nunca pelo cadastro.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "ITEM_ESTOQUE")
public class ItemEstoque extends BaseEntity {

    @Column(name = "CODIGO", nullable = false, length = 20)
    private String codigo;

    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;

    @Column(name = "DESCRICAO", length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORIA", nullable = false, length = 15)
    private CategoriaItemEstoque categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "UNIDADE", nullable = false, length = 5)
    private UnidadeMedida unidade;

    /** Abaixo dele, o item aparece como "Baixo". */
    @Column(name = "ESTOQUE_MINIMO", nullable = false)
    private Integer estoqueMinimo;

    /** Onde fica no almoxarifado (ex.: "Prateleira A3"). */
    @Column(name = "LOCALIZACAO", length = 100)
    private String localizacao;

    @Column(name = "SALDO", nullable = false)
    private Integer saldo = 0;
}
