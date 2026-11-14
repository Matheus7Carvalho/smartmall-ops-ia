package com.smartmall.ops.api.controller.disponibilidade;

import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.model.disponibilidade.AusenciaRequest;
import com.smartmall.ops.domain.model.disponibilidade.AusenciaResponse;
import com.smartmall.ops.domain.model.disponibilidade.FuncionarioDisponibilidadeResponse;
import com.smartmall.ops.domain.service.disponibilidade.IDisponibilidadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Disponibilidade dos funcionários e ausências. Administrador e Supervisor (SecurityConfiguration). */
@RestController
@Tag(name = "Disponibilidade", description = "Funcionários disponíveis, ocupados ou indisponíveis, e registro de ausências.")
public class DisponibilidadeController {

    private final IDisponibilidadeService service;

    public DisponibilidadeController(IDisponibilidadeService service) {
        this.service = service;
    }

    @GetMapping(value = "/api/disponibilidade", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Funcionários ativos com a situação de hoje, equipes, tarefa atual e ausência.")
    public List<FuncionarioDisponibilidadeResponse> hoje() {
        return service.hoje();
    }

    @PostMapping(value = "/api/ausencia", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(description = "Registra uma ausência (dias inteiros, inclusive).")
    public AusenciaResponse registrar(@Valid @RequestBody AusenciaRequest request, @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.registrarAusencia(request, usuario.getId());
    }

    @PostMapping("/api/ausencia/{id}/encerrar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(description = "Encerra a ausência: o funcionário volta a ficar disponível hoje.")
    public void encerrar(@PathVariable String id) {
        service.encerrarAusencia(id);
    }
}
