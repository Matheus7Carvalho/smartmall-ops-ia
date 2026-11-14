package com.smartmall.ops.api.controller.tarefa;

import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.tarefa.FiltroTarefas;
import com.smartmall.ops.domain.model.tarefa.TarefaResponse;
import com.smartmall.ops.domain.model.tarefa.ResumoTarefasResponse;
import com.smartmall.ops.domain.service.tarefa.ITarefaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Tarefas. Consulta: todos os perfis (Funcionário vê só as das suas equipes).
 * Cancelar/restaurar: Administrador e Supervisor (SecurityConfiguration).
 */
@RestController
@RequestMapping(value = "/api/tarefa", produces = "application/json")
@Tag(name = "Tarefa", description = "Tarefas: hoje geradas pelas manutenções programadas; no futuro, também pelos chamados.")
public class TarefaController {

    private final ITarefaService service;

    public TarefaController(ITarefaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(description = "Tarefas do período (máximo de 93 dias).")
    public List<TarefaResponse> agenda(@Valid FiltroTarefas filtro, @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.agenda(filtro, membroId(usuario));
    }

    @GetMapping("/resumo")
    @Operation(description = "Indicadores: atrasadas, próximos 7 dias e agendadas no mês.")
    public ResumoTarefasResponse resumo(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.resumo(membroId(usuario));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(description = "Cancela uma data específica.")
    public TarefaResponse cancelar(@PathVariable String id, @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.cancelar(id, usuario.getId());
    }

    @PostMapping("/{id}/restaurar")
    @Operation(description = "Desfaz o cancelamento de uma data futura.")
    public TarefaResponse restaurar(@PathVariable String id, @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.restaurar(id, usuario.getId());
    }

    /** Funcionário vê só as tarefas das equipes de que é membro. */
    private static String membroId(UsuarioAutenticado usuario) {
        return usuario.getPerfil() == Perfil.FUNCIONARIO ? usuario.getId() : null;
    }
}
