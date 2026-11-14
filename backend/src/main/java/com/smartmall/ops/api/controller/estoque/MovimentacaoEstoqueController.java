package com.smartmall.ops.api.controller.estoque;

import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import com.smartmall.ops.domain.model.estoque.FiltroMovimentacoes;
import com.smartmall.ops.domain.model.estoque.MovimentacaoRequest;
import com.smartmall.ops.domain.model.estoque.MovimentacaoResponse;
import com.smartmall.ops.domain.service.estoque.IMovimentacaoEstoqueService;
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

/**
 * Movimentações de estoque. Entrada: Administrador e Supervisor. Retirada e consultas: todos os perfis
 * (o Funcionário retira material para o serviço). Regras de perfil em SecurityConfiguration.
 */
@RestController
@Tag(name = "Estoque", description = "Itens do almoxarifado: peças, ferramentas, consumíveis e EPIs.")
public class MovimentacaoEstoqueController {

    private final IMovimentacaoEstoqueService service;

    public MovimentacaoEstoqueController(IMovimentacaoEstoqueService service) {
        this.service = service;
    }

    @PostMapping(value = "/api/estoque/item/{id}/entrada", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(description = "Registra a entrada e soma ao saldo.")
    public MovimentacaoResponse entrada(@PathVariable String id, @Valid @RequestBody MovimentacaoRequest request,
                                        @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.movimentar(id, TipoMovimentacao.ENTRADA, request, usuario.getId());
    }

    @PostMapping(value = "/api/estoque/item/{id}/retirada", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(description = "Registra a retirada; recusa se o saldo não for suficiente.")
    public MovimentacaoResponse retirada(@PathVariable String id, @Valid @RequestBody MovimentacaoRequest request,
                                         @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.movimentar(id, TipoMovimentacao.RETIRADA, request, usuario.getId());
    }

    @GetMapping(value = "/api/estoque/item/{id}/movimentacoes", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Rastreabilidade do item: todas as movimentações, da mais recente para a mais antiga.")
    public List<MovimentacaoResponse> doItem(@PathVariable String id) {
        return service.doItem(id);
    }

    @GetMapping(value = "/api/estoque/destinos", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Equipamentos que podem ser destino de uma retirada (id, código e nome).")
    public List<MovimentacaoResponse.Resumo> destinos() {
        return service.destinos();
    }

    @GetMapping(value = "/api/estoque/movimentacao", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Histórico geral do período (máximo de 366 dias), com filtros por item, equipamento e tipo.")
    public List<MovimentacaoResponse> historico(@Valid FiltroMovimentacoes filtro) {
        return service.buscar(filtro);
    }
}
