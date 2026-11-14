package com.smartmall.ops.api.controller.usuario;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.model.usuario.IUsuarioMapperImpl;
import com.smartmall.ops.domain.service.usuario.IUsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
@Import({IUsuarioMapperImpl.class, WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class UsuarioControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private IUsuarioService service;
    @MockitoBean private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "FUNCIONARIO")
    void funcionarioNaoAcessa() throws Exception {
        mvc.perform(get("/api/usuario/funcionarios")).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void listaFuncionariosSemSenha() throws Exception {
        when(service.funcionariosAtivos()).thenReturn(List.of(new Usuario("João Costa", "funcionario@smartmall.local", "hash", Perfil.FUNCIONARIO, true)));

        mvc.perform(get("/api/usuario/funcionarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("João Costa"))
                .andExpect(jsonPath("$[0].senha").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void filtraUsuariosComPaginacaoSemExporSenha() throws Exception {
        var usuario = new Usuario("José Almeida", "jose@smartmall.local", "hash", Perfil.FUNCIONARIO, true);
        usuario.setId("usuario-1");
        when(service.filtrar(eq("jose"), isNull(), eq(Perfil.FUNCIONARIO), eq(true), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(usuario), PageRequest.of(0, 20), 1));

        mvc.perform(get("/api/usuario/filtrar").param("nome", "jose").param("perfil", "FUNCIONARIO")
                        .param("ativo", "true").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].nome").value("José Almeida"))
                .andExpect(jsonPath("$.content[0].senha").doesNotExist())
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void criaEditaEExcluiUsuario() throws Exception {
        var usuario = new Usuario("Novo", "novo@smartmall.local", "hash", Perfil.FUNCIONARIO, true);
        usuario.setId("usuario-1");
        when(service.create(any(Usuario.class))).thenReturn(usuario);
        when(service.atualizar(any(Usuario.class), eq("usuario-1"), isNull())).thenReturn(usuario);

        mvc.perform(post("/api/usuario").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Novo","email":"novo@smartmall.local","senha":"segredo1","perfil":"FUNCIONARIO","ativo":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("usuario-1"))
                .andExpect(jsonPath("$.senha").doesNotExist());
        mvc.perform(put("/api/usuario/usuario-1").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Novo","email":"novo@smartmall.local","perfil":"FUNCIONARIO","ativo":true}
                                """))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/usuario/usuario-1")).andExpect(status().isNoContent());
    }

    @Test
    void semSessaoNaoConsultaUsuarios() throws Exception {
        mvc.perform(get("/api/usuario/filtrar")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
}
