package com.smartmall.ops.domain.model.equipe;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipeResponse {
    private String id;
    private String nome;
    private List<Membro> membros;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Membro {
        private String id;
        private String nome;
    }
}
