package com.smartmall.ops.api.controller.checklist;

import com.smartmall.ops.domain.core.controller.BaseController;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.model.checklist.ChecklistRequest;
import com.smartmall.ops.domain.model.checklist.ChecklistResponse;
import com.smartmall.ops.domain.model.checklist.IChecklistMapper;
import com.smartmall.ops.domain.service.checklist.IChecklistService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Cadastro de modelos de checklist. Restrito a Administrador e Supervisor em SecurityConfiguration. */
@RestController
@RequestMapping(value = "/api/checklist", produces = "application/json")
@Tag(name = "Modelo de checklist", description = "Modelos de checklist usados nas tarefas.")
public class ChecklistController extends BaseController<Checklist, ChecklistRequest, ChecklistResponse> {

    protected ChecklistController(final IChecklistMapper mapper, final IChecklistService service) {
        super(mapper, service);
    }
}
