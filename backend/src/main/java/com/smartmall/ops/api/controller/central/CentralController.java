package com.smartmall.ops.api.controller.central;

import com.smartmall.ops.domain.model.central.ResumoCentralResponse;
import com.smartmall.ops.domain.service.central.ICentralService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Central de Controle: Administrador e Supervisor (SecurityConfiguration). */
@RestController
@RequestMapping(value = "/api/central", produces = "application/json")
@Tag(name = "Central de Controle", description = "Visão geral da operação para o gestor.")
public class CentralController {

    private final ICentralService service;

    public CentralController(ICentralService service) {
        this.service = service;
    }

    @GetMapping("/resumo")
    @Operation(description = "Tarefas ativas, equipes em operação, equipamentos monitorados e alertas.")
    public ResumoCentralResponse resumo() {
        return service.resumo();
    }
}
