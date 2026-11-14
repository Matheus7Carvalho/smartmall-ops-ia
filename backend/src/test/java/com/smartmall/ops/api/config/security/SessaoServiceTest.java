package com.smartmall.ops.api.config.security;

import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.auth.LoginRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessaoServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private SecurityContextRepository contextRepository;

    private SessaoService sessaoService;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private UsuarioAutenticado principal;

    @BeforeEach
    void setUp() {
        sessaoService = new SessaoService(authenticationManager, contextRepository);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        principal = new UsuarioAutenticado(new Usuario("Ana Souza", "supervisor@smartmall.local", null, Perfil.SUPERVISOR, true));
    }

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    private void autenticacaoValida() {
        when(authenticationManager.authenticate(any()))
                .thenReturn(UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
    }

    @Test
    void enviaCredenciaisComEmailSemEspacos() {
        autenticacaoValida();

        sessaoService.entrar(new LoginRequest("  supervisor@smartmall.local ", "demo123"), request, response);

        var captor = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(captor.capture());
        assertThat(captor.getValue().getPrincipal()).isEqualTo("supervisor@smartmall.local");
        assertThat(captor.getValue().getCredentials()).isEqualTo("demo123");
        assertThat(captor.getValue().isAuthenticated()).isFalse();
    }

    @Test
    void gravaContextoNaSessaoERetornaUsuario() {
        autenticacaoValida();

        var usuario = sessaoService.entrar(new LoginRequest("supervisor@smartmall.local", "demo123"), request, response);

        assertThat(usuario).isSameAs(principal);
        var captor = ArgumentCaptor.forClass(SecurityContext.class);
        verify(contextRepository).saveContext(captor.capture(), any(), any());
        assertThat(captor.getValue().getAuthentication().getPrincipal()).isSameAs(principal);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isSameAs(principal);
    }

    @Test
    void trocaIdDeSessaoExistenteParaEvitarFixacao() {
        autenticacaoValida();
        var idAnterior = request.getSession(true).getId();

        sessaoService.entrar(new LoginRequest("supervisor@smartmall.local", "demo123"), request, response);

        assertThat(request.getSession(false).getId()).isNotEqualTo(idAnterior);
    }

    @Test
    void naoCriaSessaoAntesDeAutenticar() {
        autenticacaoValida();

        sessaoService.entrar(new LoginRequest("supervisor@smartmall.local", "demo123"), request, response);

        // A sessão é criada pelo repositório (mockado aqui), não pela troca de id.
        assertThat(request.getSession(false)).isNull();
    }

    @Test
    void falhaDeAutenticacaoNaoGravaContexto() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("x"));

        assertThatThrownBy(() -> sessaoService.entrar(new LoginRequest("supervisor@smartmall.local", "errada"), request, response))
                .isInstanceOf(BadCredentialsException.class);

        verify(contextRepository, never()).saveContext(any(), any(), any());
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
