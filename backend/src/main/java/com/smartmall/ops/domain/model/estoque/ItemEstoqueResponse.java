package com.smartmall.ops.domain.model.estoque;

import com.smartmall.ops.domain.entity.enums.CategoriaItemEstoque;
import com.smartmall.ops.domain.entity.enums.UnidadeMedida;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemEstoqueResponse {
    private String id;
    private String codigo;
    private String nome;
    private String descricao;
    private CategoriaItemEstoque categoria;
    private UnidadeMedida unidade;
    private Integer estoqueMinimo;
    private String localizacao;
    private Integer saldo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
