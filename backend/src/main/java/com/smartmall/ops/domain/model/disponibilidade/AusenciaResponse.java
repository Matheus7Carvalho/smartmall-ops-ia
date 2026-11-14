package com.smartmall.ops.domain.model.disponibilidade;

import com.smartmall.ops.domain.entity.Ausencia;
import com.smartmall.ops.domain.entity.enums.MotivoAusencia;

import java.time.LocalDate;

public record AusenciaResponse(String id, MotivoAusencia motivo, LocalDate inicio, LocalDate fim) {

    public static AusenciaResponse de(Ausencia a) {
        return new AusenciaResponse(a.getId(), a.getMotivo(), a.getInicio(), a.getFim());
    }
}
