package com.smartmall.ops.api.controller.equipamento;

import com.smartmall.ops.domain.core.controller.BaseController;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.model.equipamento.EquipamentoRequest;
import com.smartmall.ops.domain.model.equipamento.EquipamentoResponse;
import com.smartmall.ops.domain.model.equipamento.IEquipamentoMapper;
import com.smartmall.ops.domain.service.equipamento.IEquipamentoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Restrito a Administrador e Supervisor em SecurityConfiguration. */
@RestController
@RequestMapping(value = "/api/equipamento", produces = "application/json")
@Tag(name = "Equipamento", description = "Ativos do shopping.")
public class EquipamentoController extends BaseController<Equipamento, EquipamentoRequest, EquipamentoResponse> {

    protected EquipamentoController(final IEquipamentoMapper mapper, final IEquipamentoService service) {
        super(mapper, service);
    }
}
