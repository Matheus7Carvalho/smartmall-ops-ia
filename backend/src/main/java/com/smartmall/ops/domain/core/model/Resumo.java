package com.smartmall.ops.domain.core.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Referência curta a uma entidade relacionada (equipamento, checklist, equipe). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resumo {
    private String id;
    private String nome;
    /** Só para equipamento. */
    private String codigo;
}
