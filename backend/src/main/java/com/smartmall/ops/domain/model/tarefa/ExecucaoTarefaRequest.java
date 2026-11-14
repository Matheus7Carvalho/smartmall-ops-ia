package com.smartmall.ops.domain.model.tarefa;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Respostas do checklist e observação do responsável (salvar ou enviar para análise). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecucaoTarefaRequest {

    @Size(max = 500, message = "A observação deve ter no máximo 500 caracteres.")
    private String observacao;

    @Valid
    @Builder.Default
    @Size(max = 50, message = "O checklist tem no máximo 50 itens.")
    private List<RespostaItemRequest> respostas = new ArrayList<>();
}
