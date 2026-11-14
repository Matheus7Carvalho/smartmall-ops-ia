package com.smartmall.ops.api.controller.piso;

import com.smartmall.ops.domain.core.controller.BaseSearchController;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.model.piso.IPisoMapper;
import com.smartmall.ops.domain.model.piso.PisoRequest;
import com.smartmall.ops.domain.model.piso.PisoResponse;
import com.smartmall.ops.domain.service.piso.IPisoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/piso", produces = "application/json")
@Tag(name = "Piso", description = "Pisos disponíveis na Central de Controle.")
public class PisoController extends BaseSearchController<Piso, PisoRequest, PisoResponse> {

    protected PisoController(final IPisoMapper mapper, final IPisoService service) {
        super(service, mapper);
    }
}
