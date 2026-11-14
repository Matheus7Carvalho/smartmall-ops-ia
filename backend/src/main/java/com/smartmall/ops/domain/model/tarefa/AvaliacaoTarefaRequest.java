package com.smartmall.ops.domain.model.tarefa;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Aprovação (observação opcional) ou reprovação (motivo obrigatório, verificado no serviço). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvaliacaoTarefaRequest {

    @Size(max = 500, message = "O texto deve ter no máximo 500 caracteres.")
    private String observacao;
}
