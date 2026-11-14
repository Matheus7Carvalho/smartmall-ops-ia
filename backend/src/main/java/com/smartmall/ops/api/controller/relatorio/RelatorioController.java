package com.smartmall.ops.api.controller.relatorio;

import com.smartmall.ops.domain.model.relatorio.FiltroRelatorio;
import com.smartmall.ops.domain.model.relatorio.RelatorioTarefasResponse;
import com.smartmall.ops.domain.service.relatorio.IRelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Relatórios operacionais: Administrador e Supervisor (SecurityConfiguration). */
@RestController
@RequestMapping(value = "/api/relatorio", produces = "application/json")
@Tag(name = "Relatório", description = "Resumos operacionais por período.")
public class RelatorioController {

    private final IRelatorioService service;

    public RelatorioController(IRelatorioService service) {
        this.service = service;
    }

    @GetMapping("/tarefas")
    @Operation(description = "Tarefas previstas no período (máximo de 366 dias): totais, por equipe e por equipamento.")
    public RelatorioTarefasResponse tarefas(@Valid FiltroRelatorio filtro) {
        return service.tarefas(filtro);
    }
}
