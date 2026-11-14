package com.smartmall.ops.domain.model.piso;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PisoResponse {
    private String id;
    private String codigo;
    private String nome;
    private Integer ordem;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
