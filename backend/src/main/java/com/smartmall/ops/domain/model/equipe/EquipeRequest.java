package com.smartmall.ops.domain.model.equipe;

import jakarta.validation.constraints.NotBlank;
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
public class EquipeRequest {

    @NotBlank(message = "Informe o nome.")
    @Size(max = 60, message = "O nome deve ter até 60 caracteres.")
    private String nome;

    @Size(max = 50, message = "A equipe pode ter até 50 membros.")
    @Builder.Default
    private List<@Size(max = 36, message = "Membro inválido.") String> membrosIds = new ArrayList<>();
}
