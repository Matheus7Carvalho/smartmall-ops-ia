package com.smartmall.ops.domain.model.chamado;

import com.smartmall.ops.domain.entity.enums.StatusChamado;

public record ChamadoPublicoResponse(String id, String protocolo, StatusChamado status) { }
