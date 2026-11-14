package com.smartmall.ops.api.controller.estoque;

import com.smartmall.ops.api.config.security.PasswordConfiguration;
import com.smartmall.ops.api.config.security.SecurityConfiguration;
import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.api.config.web.WebConfiguration;
import com.smartmall.ops.domain.entity.ItemEstoque;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import com.smartmall.ops.domain.entity.enums.UnidadeMedida;
import com.smartmall.ops.domain.model.estoque.IItemEstoqueMapper;
import com.smartmall.ops.domain.model.estoque.ItemEstoqueResponse;
import com.smartmall.ops.domain.model.estoque.MovimentacaoResponse;
import com.smartmall.ops.domain.service.estoque.IItemEstoqueService;
import com.smartmall.ops.domain.service.estoque.IMovimentacaoEstoqueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({ItemEstoqueController.class, MovimentacaoEstoqueController.class})
@Import({WebConfiguration.class, SecurityConfiguration.class, PasswordConfiguration.class})
class EstoqueControllerTest {

    @Autowired private MockMvc mvc;
    @MockitoBean private IItemEstoqueService itemService;
    @MockitoBean private IItemEstoqueMapper mapper;
    @MockitoBean private IMovimentacaoEstoqueService movimentacaoService;
    @MockitoBean private UserDetailsService userDetailsService;

    private RequestPostProcessor como(Perfil perfil) {
        var usuario = new Usuario("Teste", "t@smartmall.local", "h", perfil, true);
        usuario.setId("u-" + perfil.name().toLowerCase());
        var autenticado = new UsuarioAutenticado(usuario);
        when(userDetailsService.loadUserByUsername(usuario.getEmail())).thenReturn(autenticado);
        return user(autenticado);
    }

    private static final String ITEM = """
            {"codigo": "FLT-01", "nome": "Filtro", "categoria": "PECA", "unidade": "UN", "estoqueMinimo": 10}
            """;
    private static final String MOVIMENTO = """
            {"quantidade": 2}
            """;

    private static MovimentacaoResponse movimento(TipoMovimentacao tipo) {
        return new MovimentacaoResponse("m1", new MovimentacaoResponse.Resumo("i1", "FLT-01", "Filtro"), UnidadeMedida.UN, tipo,
                2, 8, LocalDateTime.of(2026, 11, 14, 10, 0), "Teste", null, null);
    }

    @Test
    void semSessaoResponde401() throws Exception {
        mvc.perform(get("/api/estoque/item")).andExpect(status().isUnauthorized());
        verifyNoInteractions(itemService, movimentacaoService);
    }

    @Test
    void funcionarioConsultaOsItens() throws Exception {
        var item = new ItemEstoque();
        when(itemService.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(new PageImpl<>(List.of(item)));
        when(mapper.toResponse(item)).thenReturn(ItemEstoqueResponse.builder().id("i1").codigo("FLT-01").saldo(10).build());

        mvc.perform(get("/api/estoque/item").with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].saldo").value(10));
    }

    @Test
    void funcionarioNaoCadastraEditaNemExclui() throws Exception {
        mvc.perform(post("/api/estoque/item").with(como(Perfil.FUNCIONARIO)).contentType(MediaType.APPLICATION_JSON).content(ITEM))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/estoque/item/i1").with(como(Perfil.FUNCIONARIO)).contentType(MediaType.APPLICATION_JSON).content(ITEM))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/estoque/item/i1").with(como(Perfil.FUNCIONARIO))).andExpect(status().isForbidden());
        verifyNoInteractions(itemService);
    }

    @Test
    void funcionarioNaoRegistraEntrada() throws Exception {
        mvc.perform(post("/api/estoque/item/i1/entrada").with(como(Perfil.FUNCIONARIO)).contentType(MediaType.APPLICATION_JSON).content(MOVIMENTO))
                .andExpect(status().isForbidden());
        verifyNoInteractions(movimentacaoService);
    }

    @Test
    void funcionarioRegistraRetiradaComoEleMesmo() throws Exception {
        when(movimentacaoService.movimentar(eq("i1"), eq(TipoMovimentacao.RETIRADA), any(), eq("u-funcionario"))).thenReturn(movimento(TipoMovimentacao.RETIRADA));

        mvc.perform(post("/api/estoque/item/i1/retirada").with(como(Perfil.FUNCIONARIO)).contentType(MediaType.APPLICATION_JSON).content(MOVIMENTO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("RETIRADA"))
                .andExpect(jsonPath("$.saldoApos").value(8))
                .andExpect(jsonPath("$.usuario").value("Teste"));
    }

    @Test
    void supervisorRegistraEntrada() throws Exception {
        when(movimentacaoService.movimentar(eq("i1"), eq(TipoMovimentacao.ENTRADA), any(), eq("u-supervisor"))).thenReturn(movimento(TipoMovimentacao.ENTRADA));

        mvc.perform(post("/api/estoque/item/i1/entrada").with(como(Perfil.SUPERVISOR)).contentType(MediaType.APPLICATION_JSON).content(MOVIMENTO))
                .andExpect(status().isCreated());
        verify(movimentacaoService).movimentar(eq("i1"), eq(TipoMovimentacao.ENTRADA), any(), eq("u-supervisor"));
    }

    @Test
    void validaAQuantidade() throws Exception {
        mvc.perform(post("/api/estoque/item/i1/retirada").with(como(Perfil.SUPERVISOR)).contentType(MediaType.APPLICATION_JSON).content("{\"quantidade\": 0}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/estoque/item/i1/retirada").with(como(Perfil.SUPERVISOR)).contentType(MediaType.APPLICATION_JSON).content("{\"quantidade\": 100001}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(movimentacaoService);
    }

    @Test
    void historicoGeralExigePeriodo() throws Exception {
        mvc.perform(get("/api/estoque/movimentacao").with(como(Perfil.FUNCIONARIO))).andExpect(status().isBadRequest());
        verifyNoInteractions(movimentacaoService);
    }

    @Test
    void funcionarioVeOsDestinosSemOutrosDadosDoEquipamento() throws Exception {
        when(movimentacaoService.destinos()).thenReturn(List.of(new MovimentacaoResponse.Resumo("e1", "HVAC-B", "Ar-condicionado")));

        mvc.perform(get("/api/estoque/destinos").with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("HVAC-B"))
                .andExpect(jsonPath("$[0].condicao").doesNotExist());
    }

    @Test
    void rastreabilidadeDoItem() throws Exception {
        when(movimentacaoService.doItem("i1")).thenReturn(List.of(movimento(TipoMovimentacao.RETIRADA)));

        mvc.perform(get("/api/estoque/item/i1/movimentacoes").with(como(Perfil.FUNCIONARIO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].item.codigo").value("FLT-01"))
                .andExpect(jsonPath("$[0].usuario").value("Teste"));
    }
}
