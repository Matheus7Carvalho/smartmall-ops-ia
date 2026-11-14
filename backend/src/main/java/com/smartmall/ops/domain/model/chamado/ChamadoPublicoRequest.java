package com.smartmall.ops.domain.model.chamado;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChamadoPublicoRequest {
    @NotBlank(message = "Descreva o relato.")
    @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
    private String descricao;
    @Size(max = 60, message = "O código do local deve ter no máximo 60 caracteres.")
    private String codigoLocal;
    @NotBlank(message = "Informe o local.")
    @Size(max = 150, message = "O local deve ter no máximo 150 caracteres.")
    private String localInformado;
    @Size(max = 150, message = "O contato deve ter no máximo 150 caracteres.")
    private String contato;
    @NotBlank(message = "Informe a chave de envio.")
    @Size(max = 36, message = "A chave de envio deve ter no máximo 36 caracteres.")
    @Pattern(regexp = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", message = "Chave de envio inválida.")
    private String chaveEnvio;
}
