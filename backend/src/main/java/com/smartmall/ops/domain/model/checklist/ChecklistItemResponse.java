package com.smartmall.ops.domain.model.checklist;

import com.smartmall.ops.domain.entity.enums.TipoResposta;
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
public class ChecklistItemResponse {
    private String id;
    private Integer ordem;
    private String pergunta;
    private TipoResposta tipoResposta;
    private Boolean obrigatorio;
    private Integer maxCaracteres;
}
