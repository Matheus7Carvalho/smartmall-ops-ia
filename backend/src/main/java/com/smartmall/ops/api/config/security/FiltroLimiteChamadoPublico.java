package com.smartmall.ops.api.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmall.ops.api.config.exception.ResponseError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Clock;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/** Limite leve para o único endpoint anônimo de escrita, antes do parser multipart. */
final class FiltroLimiteChamadoPublico extends OncePerRequestFilter {

    static final String CAMINHO = "/api/publico/chamado";
    static final String CABECALHO_LOCAL = "X-Local-Codigo";
    static final String CABECALHO_IP_PROXY = "X-Real-IP";
    private static final int MAX_CHAVES = 50_000;

    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final int limiteIp;
    private final int limiteIpLocal;
    private final int janelaSegundos;
    private final boolean confiarIpProxy;
    private final long janelaMillis;
    private final Map<String, Balde> baldes = new ConcurrentHashMap<>();
    private final AtomicLong ultimaLimpeza = new AtomicLong();

    FiltroLimiteChamadoPublico(ObjectMapper objectMapper, Clock clock, int limiteIp, int limiteIpLocal,
                              int janelaSegundos, boolean confiarIpProxy) {
        if (limiteIp < 1 || limiteIpLocal < 1 || janelaSegundos < 1) {
            throw new IllegalArgumentException("Os limites do chamado público devem ser positivos.");
        }
        this.objectMapper = objectMapper;
        this.clock = clock;
        this.limiteIp = limiteIp;
        this.limiteIpLocal = limiteIpLocal;
        this.janelaSegundos = janelaSegundos;
        this.confiarIpProxy = confiarIpProxy;
        this.janelaMillis = janelaSegundos * 1000L;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String caminho = request.getRequestURI().substring(request.getContextPath().length());
        return !"POST".equals(request.getMethod()) || !CAMINHO.equals(caminho);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long agora = clock.millis();
        String ip = ipCliente(request);
        String codigo = codigoLocal(request.getHeader(CABECALHO_LOCAL));

        // O cabeçalho é apenas um sinal de limitação. O serviço valida o local no corpo do pedido.
        boolean permitido;
        synchronized (baldes) {
            limparPeriodicamente(agora);
            permitido = baldes.size() < MAX_CHAVES
                    && permitir("ip:" + ip, limiteIp, agora, false)
                    && permitir("ip-local:" + ip + ":" + codigo, limiteIpLocal, agora, false);
            if (permitido) {
                permitir("ip:" + ip, limiteIp, agora, true);
                permitir("ip-local:" + ip + ":" + codigo, limiteIpLocal, agora, true);
            }
        }
        if (!permitido) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(janelaSegundos));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getOutputStream(), ResponseError.builder()
                    .status(HttpStatus.TOO_MANY_REQUESTS.value())
                    .message("Muitos envios em pouco tempo. Tente novamente em alguns minutos.")
                    .build());
            return;
        }

        chain.doFilter(request, response);
    }

    private String codigoLocal(String valor) {
        if (valor == null) return "sem-local";
        String codigo = valor.trim();
        return codigo.matches("[A-Za-z0-9_-]{1,64}") ? codigo.toLowerCase(Locale.ROOT) : "sem-local";
    }

    private String ipCliente(HttpServletRequest request) {
        // Somente o container sem porta publicada confia no nginx, que substitui X-Real-IP por $remote_addr.
        if (confiarIpProxy) {
            String encaminhado = request.getHeader(CABECALHO_IP_PROXY);
            if (encaminhado != null && encaminhado.length() <= 45
                    && encaminhado.matches("[0-9a-fA-F:.]+")) {
                return encaminhado;
            }
        }
        return request.getRemoteAddr() == null ? "desconhecido" : request.getRemoteAddr();
    }

    private boolean permitir(String chave, int limite, long agora, boolean registrar) {
        Balde balde = baldes.computeIfAbsent(chave, ignored -> new Balde());
        synchronized (balde) {
            while (!balde.envios.isEmpty() && balde.envios.peekFirst() <= agora - janelaMillis) {
                balde.envios.removeFirst();
            }
            if (balde.envios.size() >= limite) return false;
            if (registrar) balde.envios.addLast(agora);
            return true;
        }
    }

    private void limparPeriodicamente(long agora) {
        long anterior = ultimaLimpeza.get();
        if (agora - anterior < janelaMillis || !ultimaLimpeza.compareAndSet(anterior, agora)) return;
        baldes.entrySet().removeIf(entrada -> {
            Balde balde = entrada.getValue();
            synchronized (balde) {
                while (!balde.envios.isEmpty() && balde.envios.peekFirst() <= agora - janelaMillis) {
                    balde.envios.removeFirst();
                }
                return balde.envios.isEmpty();
            }
        });
    }

    private static final class Balde {
        private final Deque<Long> envios = new ArrayDeque<>();
    }
}
