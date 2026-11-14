package com.smartmall.ops.domain.model.checklist;

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
public class ChecklistResponse {
    private String id;
    private String nome;
    private List<ChecklistItemResponse> itens;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
