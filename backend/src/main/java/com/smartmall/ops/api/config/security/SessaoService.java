package com.smartmall.ops.api.config.security;

import com.smartmall.ops.domain.model.auth.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class SessaoService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;

    public SessaoService(AuthenticationManager authenticationManager, SecurityContextRepository contextRepository) {
        this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository;
    }

    /** Autentica e grava o contexto na sessão HTTP. Lança AuthenticationException se falhar. */
    public UsuarioAutenticado entrar(LoginRequest login, HttpServletRequest request, HttpServletResponse response) {
        var authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(login.getEmail().trim(), login.getSenha()));

        // Evita fixação de sessão: um id de sessão anterior ao login não continua válido.
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }

        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);

        return (UsuarioAutenticado) authentication.getPrincipal();
    }
}
