package com.smartmall.ops.domain.model.estoque;

import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Histórico geral: período (inclusive) e filtros opcionais (query string). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FiltroMovimentacoes {

    @NotNull(message = "Informe a data inicial.")
    private LocalDate de;

    @NotNull(message = "Informe a data final.")
    private LocalDate ate;

    @Size(max = 36)
    private String itemId;

    @Size(max = 36)
    private String equipamentoId;

    private TipoMovimentacao tipo;
}
