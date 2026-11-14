package com.smartmall.ops.domain.model.tarefa;

import jakarta.validation.constraints.NotBlank;
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
public class RespostaItemRequest {

    @NotBlank(message = "Informe o item.")
    @Size(max = 36)
    private String itemId;

    /** SIM_NAO: "SIM"/"NAO"; NUMERO: número; TEXTO: até o máximo do item. Vazio = sem resposta. */
    @Size(max = 500, message = "A resposta deve ter no máximo 500 caracteres.")
    private String resposta;
}
