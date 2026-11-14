package com.smartmall.ops.domain.model.relatorio;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Período (inclusive) e equipe opcional dos relatórios (query string). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FiltroRelatorio {

    @NotNull(message = "Informe a data inicial.")
    private LocalDate de;

    @NotNull(message = "Informe a data final.")
    private LocalDate ate;

    @Size(max = 36)
    private String equipeId;
}
