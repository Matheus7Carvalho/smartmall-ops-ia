package com.smartmall.ops.api.controller.chamado;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import com.smartmall.ops.domain.model.chamado.ChamadoPublicoResponse;
import com.smartmall.ops.domain.model.chamado.LocalQrResponse;
import com.smartmall.ops.domain.service.chamado.ChamadoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChamadoPublicoController.class)
@Import({SecurityConfiguration.class, PasswordConfiguration.class})
class ChamadoPublicoControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ChamadoService service;
    @MockitoBean UserDetailsService userDetailsService;

    @Test void localDoQrEhConsultadoSemLogin() throws Exception {
        when(service.local("banheiro-norte")).thenReturn(new LocalQrResponse("banheiro-norte", "Banheiro Norte", "Piso L1"));
        mvc.perform(get("/api/publico/local/banheiro-norte"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigo").value("banheiro-norte"))
                .andExpect(jsonPath("$.piso").value("Piso L1"));
    }

    @Test void registraMultipartSemLoginEDevolveProtocolo() throws Exception {
        var dados = new MockMultipartFile("dados", "dados.json", MediaType.APPLICATION_JSON_VALUE,
                """
                {"descricao":"Vazamento no banheiro","codigoLocal":"banheiro-norte","localInformado":"Banheiro Norte","chaveEnvio":"d0f3a684-1b75-4ba9-bde1-8aa502273218"}
                """.getBytes());
        when(service.registrar(any(), isNull(), isNull()))
                .thenReturn(new ChamadoPublicoResponse("c1", "CH-1234", StatusChamado.EM_ANALISE));
        mvc.perform(multipart("/api/publico/chamado").file(dados))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.protocolo").value("CH-1234"))
                .andExpect(jsonPath("$.status").value("EM_ANALISE"));
    }

    @Test void recusaDescricaoVaziaAntesDoServico() throws Exception {
        var dados = new MockMultipartFile("dados", "dados.json", MediaType.APPLICATION_JSON_VALUE,
                """
                {"descricao":"","localInformado":"Entrada","chaveEnvio":"d0f3a684-1b75-4ba9-bde1-8aa502273218"}
                """.getBytes());
        mvc.perform(multipart("/api/publico/chamado").file(dados))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
