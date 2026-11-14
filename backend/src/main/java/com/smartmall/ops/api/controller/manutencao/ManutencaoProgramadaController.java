package com.smartmall.ops.api.controller.manutencao;

import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.core.controller.BaseController;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.model.manutencao.IManutencaoProgramadaMapper;
import com.smartmall.ops.domain.model.manutencao.ManutencaoProgramadaRequest;
import com.smartmall.ops.domain.model.manutencao.ManutencaoProgramadaResponse;
import com.smartmall.ops.domain.service.manutencao.IManutencaoProgramadaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.SortDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Restrito a Administrador e Supervisor em SecurityConfiguration. */
@RestController
@RequestMapping(value = "/api/manutencao-programada", produces = "application/json")
@Tag(name = "Manutenção programada", description = "Recorrências que geram tarefas de manutenção.")
public class ManutencaoProgramadaController extends BaseController<ManutencaoProgramada, ManutencaoProgramadaRequest, ManutencaoProgramadaResponse> {

    private final IManutencaoProgramadaService programadaService;

    protected ManutencaoProgramadaController(final IManutencaoProgramadaMapper mapper, final IManutencaoProgramadaService service) {
        super(mapper, service);
        this.programadaService = service;
    }

    /** Listagem com a próxima data agendada de cada programada. */
    @Override
    @GetMapping
    @Operation(description = "Manutenções programadas com a próxima tarefa agendada.")
    public Page<ManutencaoProgramadaResponse> findAll(@SortDefault(sort = "dataCriacao", direction = Sort.Direction.DESC) Pageable pageable) {
        var pagina = programadaService.findAll(pageable);
        var proximas = programadaService.proximasDatas(pagina.getContent());
        return pagina.map(programada -> {
            var resposta = getMapper().toResponse(programada);
            resposta.setProximaData(proximas.get(programada.getId()));
            return resposta;
        });
    }

    @PostMapping("/{id}/encerrar")
    @Transactional
    @Operation(description = "Desativa a manutenção programada e cancela as tarefas futuras ainda agendadas.")
    public ManutencaoProgramadaResponse encerrar(@PathVariable String id, @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return getMapper().toResponse(programadaService.encerrar(id, usuario.getId()));
    }
}
