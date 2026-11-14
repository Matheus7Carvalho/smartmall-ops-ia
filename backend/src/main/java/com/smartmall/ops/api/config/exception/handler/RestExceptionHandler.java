package com.smartmall.ops.api.config.exception.handler;

import com.smartmall.ops.api.config.exception.ResponseError;
import com.smartmall.ops.domain.core.exception.DomainException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.hibernate.exception.DataException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RestControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String ERRO_NAO_ESPERADO = "Erro não esperado.";

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ResponseError> handleConstraintException(Exception ex, WebRequest request) {
        log.info(ERRO_NAO_ESPERADO, ex);

        HttpMethod method = ((ServletWebRequest) request).getHttpMethod();

        if (ex.getCause() instanceof ConstraintViolationException
                && method == HttpMethod.DELETE) {
            return new ResponseEntity<>(ResponseError.constraintException(ex), HttpStatus.BAD_REQUEST);
        }
        if (ex.getCause() instanceof DataException) {
            return new ResponseEntity<>(ResponseError.entityDataException(ex), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(ResponseError.notMappedException(ex), HttpStatus.BAD_REQUEST);
    }

    // Os dois métodos abaixo sobrescrevem a classe base, que já os registra como @ExceptionHandler.
    // Anotá-los de novo causa "Ambiguous @ExceptionHandler" no Spring 6.
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        log.info(ERRO_NAO_ESPERADO, ex);
        return new ResponseEntity<>(ResponseError.badRequest(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        log.info(ERRO_NAO_ESPERADO, ex);
        return new ResponseEntity<>(ResponseError.badRequest(ex), HttpStatus.BAD_REQUEST);
    }

    /** Arquivo acima de spring.servlet.multipart.max-file-size. */
    @Override
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        log.info(ERRO_NAO_ESPERADO, ex);
        return new ResponseEntity<>(ResponseError.of(HttpStatus.PAYLOAD_TOO_LARGE, "A imagem deve ter no máximo 5 MB."), HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ResponseError> handleNotFoundException(Exception ex) {
        return new ResponseEntity<>(ResponseError.notFound(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ResponseError> handleAuthenticationException(AuthenticationException ex) {
        var message = ex instanceof DisabledException ? "Usuário inativo." : "E-mail ou senha inválidos.";
        return new ResponseEntity<>(ResponseError.of(HttpStatus.UNAUTHORIZED, message), HttpStatus.UNAUTHORIZED);
    }

    /** Lançada por @PreAuthorize quando o perfil não tem acesso. */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseError> handleAccessDeniedException(AccessDeniedException ex) {
        return new ResponseEntity<>(ResponseError.of(HttpStatus.FORBIDDEN, "Acesso não permitido para o seu perfil."), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(DomainException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<ResponseError> handleDomainException(Exception ex) {
        log.info(ERRO_NAO_ESPERADO, ex);
        return new ResponseEntity<>(ResponseError.badRequest(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ResponseError> handleGlobalException(Exception ex) {
        log.info(ERRO_NAO_ESPERADO, ex);
        return new ResponseEntity<>(ResponseError.notMappedException(ex), HttpStatus.BAD_REQUEST);
    }
}
