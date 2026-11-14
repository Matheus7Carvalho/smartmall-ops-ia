package com.smartmall.ops.api.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;

class FiltroLimiteChamadoPublicoTest {

    @Test
    void limitaPorIpELocalSemBloquearOutrosVisitantes() throws Exception {
        var filtro = new FiltroLimiteChamadoPublico(new ObjectMapper(), Clock.fixed(Instant.EPOCH, ZoneOffset.UTC), 2, 1, 600, false);
        var encaminhados = new AtomicInteger();
        FilterChain cadeia = (req, res) -> encaminhados.incrementAndGet();

        var primeiro = enviar(filtro, cadeia, "10.0.0.1", "banheiro-norte");
        var repetido = enviar(filtro, cadeia, "10.0.0.1", "banheiro-norte");
        var outroLocal = enviar(filtro, cadeia, "10.0.0.1", "entrada");
        var limiteIp = enviar(filtro, cadeia, "10.0.0.1", "estacionamento");
        var outroVisitante = enviar(filtro, cadeia, "10.0.0.2", "banheiro-norte");

        assertThat(primeiro.getStatus()).isEqualTo(200);
        assertThat(repetido.getStatus()).isEqualTo(429);
        assertThat(repetido.getHeader("Retry-After")).isEqualTo("600");
        assertThat(repetido.getContentAsString()).contains("Muitos envios");
        assertThat(outroLocal.getStatus()).isEqualTo(200);
        assertThat(limiteIp.getStatus()).isEqualTo(429);
        assertThat(outroVisitante.getStatus()).isEqualTo(200);
        assertThat(encaminhados).hasValue(3);
    }

    @Test
    void liberaNovosEnviosAposJanela() throws Exception {
        var tempo = new AtomicLong(0L);
        Clock relogio = new Clock() {
            @Override public ZoneId getZone() { return ZoneOffset.UTC; }
            @Override public Clock withZone(ZoneId zone) { return this; }
            @Override public Instant instant() { return Instant.ofEpochMilli(tempo.get()); }
        };
        var filtro = new FiltroLimiteChamadoPublico(new ObjectMapper(), relogio, 1, 1, 60, false);
        FilterChain cadeia = (req, res) -> { };

        assertThat(enviar(filtro, cadeia, "10.0.0.1", "entrada").getStatus()).isEqualTo(200);
        assertThat(enviar(filtro, cadeia, "10.0.0.1", "entrada").getStatus()).isEqualTo(429);
        tempo.set(60_001L);
        assertThat(enviar(filtro, cadeia, "10.0.0.1", "entrada").getStatus()).isEqualTo(200);
    }

    @Test
    void naoAplicaLimiteAConsultasOuOutrosEndpoints() throws Exception {
        var filtro = new FiltroLimiteChamadoPublico(new ObjectMapper(), Clock.fixed(Instant.EPOCH, ZoneOffset.UTC), 1, 1, 60, false);
        var encaminhados = new AtomicInteger();
        FilterChain cadeia = (req, res) -> encaminhados.incrementAndGet();
        var consulta = new MockHttpServletRequest("GET", "/api/publico/local/entrada");
        var outro = new MockHttpServletRequest("POST", "/api/auth/login");

        filtro.doFilter(consulta, new MockHttpServletResponse(), cadeia);
        filtro.doFilter(outro, new MockHttpServletResponse(), cadeia);

        assertThat(encaminhados).hasValue(2);
    }

    @Test
    void ignoraCabecalhoDeIpEmAcessoDireto() throws Exception {
        var filtro = new FiltroLimiteChamadoPublico(new ObjectMapper(), Clock.fixed(Instant.EPOCH, ZoneOffset.UTC), 1, 1, 60, false);
        FilterChain cadeia = (req, res) -> { };

        assertThat(enviarComIpProxy(filtro, cadeia, "10.0.0.1", "192.0.2.1").getStatus()).isEqualTo(200);
        assertThat(enviarComIpProxy(filtro, cadeia, "10.0.0.1", "192.0.2.2").getStatus()).isEqualTo(429);
    }

    @Test
    void usaIpSubstituidoPeloProxyApenasNoContainer() throws Exception {
        var filtro = new FiltroLimiteChamadoPublico(new ObjectMapper(), Clock.fixed(Instant.EPOCH, ZoneOffset.UTC), 1, 1, 60, true);
        FilterChain cadeia = (req, res) -> { };

        assertThat(enviarComIpProxy(filtro, cadeia, "172.18.0.2", "192.0.2.1").getStatus()).isEqualTo(200);
        assertThat(enviarComIpProxy(filtro, cadeia, "172.18.0.2", "192.0.2.2").getStatus()).isEqualTo(200);
        assertThat(enviarComIpProxy(filtro, cadeia, "172.18.0.2", "192.0.2.1").getStatus()).isEqualTo(429);
    }

    private MockHttpServletResponse enviar(FiltroLimiteChamadoPublico filtro, FilterChain cadeia,
                                            String ip, String local) throws Exception {
        var pedido = new MockHttpServletRequest("POST", FiltroLimiteChamadoPublico.CAMINHO);
        pedido.setRemoteAddr(ip);
        pedido.addHeader(FiltroLimiteChamadoPublico.CABECALHO_LOCAL, local);
        var resposta = new MockHttpServletResponse();
        filtro.doFilter(pedido, resposta, cadeia);
        return resposta;
    }

    private MockHttpServletResponse enviarComIpProxy(FiltroLimiteChamadoPublico filtro, FilterChain cadeia,
                                                      String ipRemoto, String ipProxy) throws Exception {
        var pedido = new MockHttpServletRequest("POST", FiltroLimiteChamadoPublico.CAMINHO);
        pedido.setRemoteAddr(ipRemoto);
        pedido.addHeader(FiltroLimiteChamadoPublico.CABECALHO_IP_PROXY, ipProxy);
        pedido.addHeader(FiltroLimiteChamadoPublico.CABECALHO_LOCAL, "entrada");
        var resposta = new MockHttpServletResponse();
        filtro.doFilter(pedido, resposta, cadeia);
        return resposta;
    }
}
