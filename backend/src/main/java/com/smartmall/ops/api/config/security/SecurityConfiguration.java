package com.smartmall.ops.api.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmall.ops.api.config.exception.ResponseError;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import java.io.IOException;

/**
 * Autenticação por sessão (cookie JSESSIONID HttpOnly, SameSite=Strict).
 * CSRF desabilitado: o frontend é servido na mesma origem (proxy /api) e o cookie SameSite=Strict
 * não é enviado em requisições de outros sites.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {

    public static final String LOGIN_URL = "/api/auth/login";
    public static final String LOGOUT_URL = "/api/auth/logout";

    /** Perfis de gestão: cadastram e supervisionam. */
    private static final String[] GESTAO = {"ADMINISTRADOR", "SUPERVISOR"};

    @Value("${app.chamado-publico.limite-ip:300}")
    private int limiteEnviosPorIp;

    @Value("${app.chamado-publico.limite-ip-local:30}")
    private int limiteEnviosPorIpELocal;

    @Value("${app.chamado-publico.janela-segundos:600}")
    private int janelaEnviosSegundos;

    @Value("${app.chamado-publico.confiar-ip-proxy:false}")
    private boolean confiarIpProxy;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository contextRepository,
                                                   UserDetailsService userDetailsService, ObjectMapper objectMapper) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .securityContext(context -> context.securityContextRepository(contextRepository))
                .addFilterBefore(new FiltroSessaoUsuario(userDetailsService, contextRepository, objectMapper),
                        AuthorizationFilter.class)
                .addFilterBefore(new FiltroLimiteChamadoPublico(objectMapper, java.time.Clock.systemUTC(),
                        limiteEnviosPorIp, limiteEnviosPorIpELocal, janelaEnviosSegundos, confiarIpProxy), AuthorizationFilter.class)
                // Restrição por perfil fica aqui, por recurso. @PreAuthorize na classe do controller NÃO
                // alcança os endpoints herdados de BaseController/BaseSearchController.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, LOGIN_URL).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/publico/local/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/publico/chamado").permitAll()
                        .requestMatchers("/api/publico/**").denyAll()
                        .requestMatchers("/api/chamado", "/api/chamado/**").hasAnyRole(GESTAO)
                        .requestMatchers("/api/central", "/api/central/**").hasAnyRole(GESTAO)
                        .requestMatchers("/api/relatorio", "/api/relatorio/**").hasAnyRole(GESTAO)
                        // Estoque: todos consultam e retiram; cadastro e entrada só a gestão.
                        .requestMatchers(HttpMethod.POST, "/api/estoque/item/*/retirada").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/estoque/item", "/api/estoque/item/**").hasAnyRole(GESTAO)
                        .requestMatchers(HttpMethod.PUT, "/api/estoque/item/**").hasAnyRole(GESTAO)
                        .requestMatchers(HttpMethod.DELETE, "/api/estoque/item/**").hasAnyRole(GESTAO)
                        .requestMatchers("/api/disponibilidade", "/api/ausencia", "/api/ausencia/**").hasAnyRole(GESTAO)
                        .requestMatchers("/api/checklist", "/api/checklist/**").hasAnyRole(GESTAO)
                        .requestMatchers("/api/equipamento", "/api/equipamento/**").hasAnyRole(GESTAO)
                        .requestMatchers("/api/equipe", "/api/equipe/**").hasAnyRole(GESTAO)
                        // Supervisores consultam candidatos a equipe; cadastro e permissoes ficam com administradores.
                        .requestMatchers(HttpMethod.GET, "/api/usuario/funcionarios").hasAnyRole(GESTAO)
                        .requestMatchers("/api/usuario", "/api/usuario/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("/api/manutencao-programada", "/api/manutencao-programada/**").hasAnyRole(GESTAO)
                        .requestMatchers(HttpMethod.POST, "/api/tarefa/*/cancelar", "/api/tarefa/*/restaurar").hasAnyRole(GESTAO)
                        .requestMatchers(HttpMethod.GET, "/api/tarefa/em-analise").hasAnyRole(GESTAO)
                        .requestMatchers(HttpMethod.POST, "/api/tarefa/*/aprovar", "/api/tarefa/*/reprovar").hasAnyRole(GESTAO)
                        // Limpeza de dados E2E (LimpezaE2EController, só no perfil dev).
                        .requestMatchers("/api/teste/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) ->
                                write(res, objectMapper, HttpStatus.UNAUTHORIZED, "Sessão expirada. Entre novamente."))
                        .accessDeniedHandler((req, res, e) ->
                                write(res, objectMapper, HttpStatus.FORBIDDEN, "Acesso não permitido para o seu perfil.")))
                .logout(logout -> logout
                        .logoutUrl(LOGOUT_URL)
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)))
                .build();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        var provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    private static void write(HttpServletResponse response, ObjectMapper mapper, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getOutputStream(), ResponseError.builder().status(status.value()).message(message).build());
    }
}
