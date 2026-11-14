package com.smartmall.ops.domain.model.equipamento;

import com.smartmall.ops.domain.entity.enums.CategoriaEquipamento;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipamentoRequest {

    @NotBlank(message = "Informe o código.")
    @Size(max = 20, message = "O código deve ter até 20 caracteres.")
    private String codigo;

    @NotBlank(message = "Informe o nome.")
    @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
    private String nome;

    @NotNull(message = "Selecione a categoria.")
    private CategoriaEquipamento categoria;

    @NotBlank(message = "Selecione o piso.")
    @Size(max = 36, message = "Piso inválido.")
    private String pisoId;

    @NotBlank(message = "Informe a localização.")
    @Size(max = 150, message = "A localização deve ter até 150 caracteres.")
    private String localizacao;

    @NotNull(message = "Selecione a condição.")
    private CondicaoEquipamento condicao;
}
