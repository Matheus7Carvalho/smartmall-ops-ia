package com.smartmall.ops.domain.model.chamado;

import com.smartmall.ops.domain.entity.enums.PrioridadeChamado;
import com.smartmall.ops.domain.entity.enums.TipoChamado;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class AprovarChamadoRequest {
    @NotNull private TipoChamado tipo;
    @NotNull private PrioridadeChamado prioridade;
    @NotBlank @Size(max = 36) private String equipeId;
    @Size(max = 36) private String equipamentoId;
    @Size(max = 36) private String checklistId;
    @NotNull private LocalDateTime dataHoraPrevista;
    @NotNull @Min(1) @Max(1440) private Integer duracaoMinutos;
}
