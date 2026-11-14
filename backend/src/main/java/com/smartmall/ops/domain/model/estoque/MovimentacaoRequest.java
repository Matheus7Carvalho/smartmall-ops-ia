package com.smartmall.ops.domain.model.estoque;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Entrada ou retirada (o tipo vem do endpoint). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimentacaoRequest {

    @NotNull(message = "Informe a quantidade.")
    @Min(value = 1, message = "A quantidade deve ser maior que zero.")
    @Max(value = 100000, message = "A quantidade deve ser até 100000.")
    private Integer quantidade;

    /** Equipamento atendido (opcional). */
    @Size(max = 36, message = "Equipamento inválido.")
    private String equipamentoId;

    @Size(max = 200, message = "A observação deve ter até 200 caracteres.")
    private String observacao;
}
