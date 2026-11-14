package com.smartmall.ops.api.controller.piso;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.model.piso.IPisoMapperImpl;
import com.smartmall.ops.domain.service.piso.IPisoService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sobe a camada web real (controller, advice, serialização), sem banco. */
@WebMvcTest(PisoController.class)
@Import({IPisoMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
@WithMockUser
class PisoControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IPisoService service;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithAnonymousUser
    void exigeAutenticacao() throws Exception {
        mvc.perform(get("/api/piso")).andExpect(status().isUnauthorized());
    }

    @Test
    void listaPisosPaginados() throws Exception {
        var piso = new Piso("L1", "Piso L1", 1);
        piso.setId("1");
        when(service.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(piso), PageRequest.of(0, 20), 1));

        mvc.perform(get("/api/piso"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].codigo").value("L1"))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void retorna404QuandoPisoNaoExiste() throws Exception {
        when(service.findById("x")).thenThrow(new EntityNotFoundException("Item não encontrado."));

        mvc.perform(get("/api/piso/x"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Item não encontrado."));
    }
}
