package com.smartmall.ops.domain.model.usuario;

import com.smartmall.ops.domain.entity.enums.Perfil;
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
public class UsuarioResponse {
    private String id;
    private String nome;
    private String email;
    private Perfil perfil;
    private Boolean ativo;
}
