package com.smartmall.ops.domain.model.piso;

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

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PisoRequest {

    @NotBlank(message = "Informe o código.")
    @Size(max = 10, message = "O código deve ter até 10 caracteres.")
    private String codigo;

    @NotBlank(message = "Informe o nome.")
    @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
    private String nome;

    @NotNull(message = "Informe a ordem.")
    @Min(value = 0, message = "A ordem deve ser entre 0 e 999.")
    @Max(value = 999, message = "A ordem deve ser entre 0 e 999.")
    private Integer ordem;
}
