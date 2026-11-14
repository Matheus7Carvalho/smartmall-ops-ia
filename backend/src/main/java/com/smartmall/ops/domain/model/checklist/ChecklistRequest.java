package com.smartmall.ops.domain.model.checklist;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistRequest {

    @NotBlank(message = "Informe o nome.")
    @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
    private String nome;

    /** A ordem da lista é a ordem de exibição. */
    @NotEmpty(message = "Adicione pelo menos um item.")
    @Size(max = 50, message = "O checklist pode ter até 50 itens.")
    @Builder.Default
    private List<@Valid ChecklistItemRequest> itens = new ArrayList<>();
}
