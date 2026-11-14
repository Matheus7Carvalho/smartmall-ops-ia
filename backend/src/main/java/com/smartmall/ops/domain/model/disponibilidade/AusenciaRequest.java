package com.smartmall.ops.domain.model.disponibilidade;

import com.smartmall.ops.domain.entity.enums.MotivoAusencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AusenciaRequest {

    @NotBlank(message = "Informe o funcionário.")
    @Size(max = 36, message = "Funcionário inválido.")
    private String usuarioId;

    @NotNull(message = "Informe a data inicial.")
    private LocalDate inicio;

    @NotNull(message = "Informe a data final.")
    private LocalDate fim;

    @NotNull(message = "Informe o motivo.")
    private MotivoAusencia motivo;
}
