package com.smartmall.ops.domain.model.estoque;

import com.smartmall.ops.domain.entity.enums.CategoriaItemEstoque;
import com.smartmall.ops.domain.entity.enums.UnidadeMedida;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Cadastro do item. O saldo não vem aqui: só muda por movimentação. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemEstoqueRequest {

    @NotBlank(message = "Informe o código.")
    @Size(max = 20, message = "O código deve ter até 20 caracteres.")
    private String codigo;

    @NotBlank(message = "Informe o nome.")
    @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
    private String nome;

    @Size(max = 500, message = "A descrição deve ter até 500 caracteres.")
    private String descricao;

    @NotNull(message = "Selecione a categoria.")
    private CategoriaItemEstoque categoria;

    @NotNull(message = "Selecione a unidade.")
    private UnidadeMedida unidade;

    @NotNull(message = "Informe o estoque mínimo.")
    @Min(value = 0, message = "O estoque mínimo não pode ser negativo.")
    @Max(value = 100000, message = "O estoque mínimo deve ser até 100000.")
    private Integer estoqueMinimo;

    @Size(max = 100, message = "A localização deve ter até 100 caracteres.")
    private String localizacao;
}
