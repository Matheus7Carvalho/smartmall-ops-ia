package com.smartmall.ops.domain.model.auth;

import jakarta.validation.constraints.Email;
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
public class LoginRequest {

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "E-mail inválido.")
    @Size(max = 150, message = "O e-mail deve ter até 150 caracteres.")
    private String email;

    /** 72: limite do BCrypt; acima disso o restante seria ignorado. */
    @NotBlank(message = "Informe a senha.")
    @Size(max = 72, message = "A senha deve ter até 72 caracteres.")
    private String senha;
}
