package com.smartmall.ops.api.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmall.ops.api.config.exception.ResponseError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

/** Atualiza as permissoes da sessao a cada requisicao autenticada. */
final class FiltroSessaoUsuario extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final SecurityContextRepository contextRepository;
    private final ObjectMapper objectMapper;

    FiltroSessaoUsuario(UserDetailsService userDetailsService, SecurityContextRepository contextRepository,
                        ObjectMapper objectMapper) {
        this.userDetailsService = userDetailsService;
        this.contextRepository = contextRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !path.startsWith("/api/")
                || SecurityConfiguration.LOGIN_URL.equals(path)
                || SecurityConfiguration.LOGOUT_URL.equals(path)
                || path.startsWith("/api/publico/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioAutenticado atual)) {
            chain.doFilter(request, response);
            return;
        }

        UserDetails detalhes;
        try {
            detalhes = userDetailsService.loadUserByUsername(atual.getEmail());
        } catch (UsernameNotFoundException exception) {
            encerrarSessao(request, response);
            return;
        }

        if (!(detalhes instanceof UsuarioAutenticado vigente)) {
            encerrarSessao(request, response);
            return;
        }

        // O endereco antigo pode ter sido atribuido a outra conta: nunca herdar suas permissoes.
        if (!Objects.equals(atual.getId(), vigente.getId()) || !vigente.isEnabled()) {
            encerrarSessao(request, response);
            return;
        }

        if (!Objects.equals(atual.getNome(), vigente.getNome())
                || !Objects.equals(atual.getEmail(), vigente.getEmail())
                || atual.getPerfil() != vigente.getPerfil()) {
            vigente.eraseCredentials();
            var renovada = UsernamePasswordAuthenticationToken.authenticated(
                    vigente, null, vigente.getAuthorities());
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(renovada);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);
        }

        chain.doFilter(request, response);
    }

    private void encerrarSessao(HttpServletRequest request, HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        var session = request.getSession(false);
        if (session != null) session.invalidate();
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), ResponseError.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Sessão expirada. Entre novamente.")
                .build());
    }
}
