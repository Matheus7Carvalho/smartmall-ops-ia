package com.smartmall.ops.api.controller.usuario;

import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.core.controller.BaseController;
import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.usuario.IUsuarioMapper;
import com.smartmall.ops.domain.model.usuario.UsuarioRequest;
import com.smartmall.ops.domain.model.usuario.UsuarioResponse;
import com.smartmall.ops.domain.service.usuario.IUsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.SortDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * CRUD restrito a Administrador; consulta de funcionários também disponível para Supervisor.
 */
@RestController
@RequestMapping(value = "/api/usuario", produces = "application/json")
@Tag(name = "Usuário", description = "Cadastro de usuários e perfis.")
public class UsuarioController extends BaseController<Usuario, UsuarioRequest, UsuarioResponse> {

    private final IUsuarioService service;
    private final IUsuarioMapper mapper;

    public UsuarioController(IUsuarioService service, IUsuarioMapper mapper) {
        super(mapper, service);
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping("/funcionarios")
    @Operation(description = "Funcionários ativos, candidatos a membros de equipe.")
    public List<UsuarioResponse> funcionarios() {
        return mapper.toListResponse(service.funcionariosAtivos());
    }

    @GetMapping("/filtrar")
    @Operation(description = "Filtra usuários e retorna resultados paginados.")
    public Page<UsuarioResponse> filtrar(@RequestParam(required = false) String nome,
                                        @RequestParam(required = false) String email,
                                        @RequestParam(required = false) Perfil perfil,
                                        @RequestParam(required = false) Boolean ativo,
                                        @SortDefault(sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {
        return service.filtrar(nome, email, perfil, ativo, pageable).map(mapper::toResponse);
    }

    @Override
    @PutMapping("/{id}")
    public UsuarioResponse update(@Valid @RequestBody UsuarioRequest request, @PathVariable String id) throws DomainException {
        UsuarioAutenticado autor = autor();
        return mapper.toResponse(service.atualizar(mapper.fromRequest(request), id, autor == null ? null : autor.getId()));
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        UsuarioAutenticado autor = autor();
        service.excluir(id, autor == null ? null : autor.getId());
        return ResponseEntity.noContent().build();
    }

    private UsuarioAutenticado autor() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof UsuarioAutenticado usuario
                ? usuario : null;
    }
}
