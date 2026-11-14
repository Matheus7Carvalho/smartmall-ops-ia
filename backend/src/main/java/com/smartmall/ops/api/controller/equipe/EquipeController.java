package com.smartmall.ops.api.controller.equipe;

import com.smartmall.ops.domain.core.controller.BaseController;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.model.equipe.EquipeRequest;
import com.smartmall.ops.domain.model.equipe.EquipeResponse;
import com.smartmall.ops.domain.model.equipe.IEquipeMapper;
import com.smartmall.ops.domain.service.equipe.IEquipeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Restrito a Administrador e Supervisor em SecurityConfiguration. */
@RestController
@RequestMapping(value = "/api/equipe", produces = "application/json")
@Tag(name = "Equipe", description = "Equipes responsáveis pelas tarefas.")
public class EquipeController extends BaseController<Equipe, EquipeRequest, EquipeResponse> {

    protected EquipeController(final IEquipeMapper mapper, final IEquipeService service) {
        super(mapper, service);
    }
}
