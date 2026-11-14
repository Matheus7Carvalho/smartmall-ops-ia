package com.smartmall.ops.api.controller.auth;

import com.smartmall.ops.api.config.security.SessaoService;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.model.auth.LoginRequest;
import com.smartmall.ops.domain.model.usuario.UsuarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** O logout (POST /api/auth/logout) é tratado pelo filtro do Spring Security. */
@RestController
@RequestMapping(value = "/api/auth", produces = "application/json")
@Tag(name = "Autenticação", description = "Login por sessão.")
public class AuthController {

    private final SessaoService sessaoService;

    public AuthController(SessaoService sessaoService) {
        this.sessaoService = sessaoService;
    }

    @PostMapping("/login")
    @Operation(description = "Autentica e abre a sessão.")
    public UsuarioResponse login(@Valid @RequestBody LoginRequest login, HttpServletRequest request, HttpServletResponse response) {
        return sessaoService.entrar(login, request, response).toResponse();
    }

    @GetMapping("/sessao")
    @Operation(description = "Usuário da sessão atual. 401 se não autenticado.")
    public UsuarioResponse sessao(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return usuario.toResponse();
    }
}
