package com.smartmall.ops.api.config.exception.handler;

import com.smartmall.ops.domain.core.exception.DomainException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;

import static org.assertj.core.api.Assertions.assertThat;

class RestExceptionHandlerTest {

    private final RestExceptionHandler handler = new RestExceptionHandler();

    @Test
    void credenciaisInvalidasViram401ComMensagemGenerica() {
        var resposta = handler.handleAuthenticationException(new BadCredentialsException("Bad credentials"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(resposta.getBody().getMessage()).isEqualTo("E-mail ou senha inválidos.");
        assertThat(resposta.getBody().getStatus()).isEqualTo(401);
    }

    @Test
    void outrasFalhasDeAutenticacaoNaoRevelamDetalhes() {
        var resposta = handler.handleAuthenticationException(new InternalAuthenticationServiceException("falha interna"));

        assertThat(resposta.getBody().getMessage()).isEqualTo("E-mail ou senha inválidos.");
        assertThat(resposta.getBody().getDebugMessage()).isNull();
    }

    @Test
    void usuarioInativoTemMensagemPropria() {
        var resposta = handler.handleAuthenticationException(new DisabledException("disabled"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(resposta.getBody().getMessage()).isEqualTo("Usuário inativo.");
    }

    @Test
    void acessoNegadoVira403() {
        var resposta = handler.handleAccessDeniedException(new AccessDeniedException("Access Denied"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(resposta.getBody().getMessage()).isEqualTo("Acesso não permitido para o seu perfil.");
    }

    @Test
    void itemInexistenteVira404() {
        var resposta = handler.handleNotFoundException(new EntityNotFoundException("Item não encontrado."));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(resposta.getBody().getMessage()).isEqualTo("Item não encontrado.");
    }

    @Test
    void regraDeNegocioVira400ComMensagemDoDominio() {
        var resposta = handler.handleDomainException(new DomainException("Já existe um piso com o código L1."));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resposta.getBody().getMessage()).isEqualTo("Já existe um piso com o código L1.");
    }
}
