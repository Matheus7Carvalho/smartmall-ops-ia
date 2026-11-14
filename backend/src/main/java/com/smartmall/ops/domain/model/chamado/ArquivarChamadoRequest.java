package com.smartmall.ops.domain.model.chamado;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ArquivarChamadoRequest {
    @NotBlank @Size(max = 500) private String motivo;
}
