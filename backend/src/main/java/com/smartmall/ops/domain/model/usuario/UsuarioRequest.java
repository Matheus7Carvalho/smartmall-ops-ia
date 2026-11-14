package com.smartmall.ops.domain.model.usuario;

import com.smartmall.ops.domain.entity.enums.Perfil;
import jakarta.validation.constraints.Email;
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
public class UsuarioRequest {

    @NotBlank(message = "Informe o nome.")
    @Size(max = 100, message = "O nome deve ter até 100 caracteres.")
    private String nome;

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "E-mail inválido.")
    @Size(max = 150, message = "O e-mail deve ter até 150 caracteres.")
    private String email;

    /** Obrigatória no cadastro; na edição, vazia ou ausente mantém a senha atual. */
    @Size(max = 72, message = "A senha deve ter até 72 caracteres.")
    private String senha;

    @NotNull(message = "Informe o perfil.")
    private Perfil perfil;

    @Builder.Default
    private Boolean ativo = Boolean.TRUE;
}
