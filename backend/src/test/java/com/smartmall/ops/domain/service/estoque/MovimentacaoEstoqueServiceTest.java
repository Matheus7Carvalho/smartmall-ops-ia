package com.smartmall.ops.domain.service.estoque;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.ItemEstoque;
import com.smartmall.ops.domain.entity.MovimentacaoEstoque;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import com.smartmall.ops.domain.entity.enums.UnidadeMedida;
import com.smartmall.ops.domain.model.estoque.FiltroMovimentacoes;
import com.smartmall.ops.domain.model.estoque.MovimentacaoRequest;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.estoque.ItemEstoqueRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovimentacaoEstoqueServiceTest {

    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);

    @Mock private ItemEstoqueRepository itemRepository;
    @Mock private MovimentacaoEstoqueRepository repository;
    @Mock private EquipamentoRepository equipamentoRepository;
    @Mock private UsuarioRepository usuarioRepository;

    private MovimentacaoEstoqueService service;
    private ItemEstoque item;
    private Usuario joao;

    @BeforeEach
    void setUp() {
        service = new MovimentacaoEstoqueService(itemRepository, repository, equipamentoRepository, usuarioRepository,
                Clock.fixed(AGORA.atZone(FUSO).toInstant(), FUSO));
        item = new ItemEstoque();
        item.setId("i1");
        item.setCodigo("FLT-01");
        item.setNome("Filtro G4");
        item.setUnidade(UnidadeMedida.UN);
        item.setSaldo(10);
        joao = new Usuario("João Costa", "joao@smartmall.local", "h", Perfil.FUNCIONARIO, true);
        joao.setId("u-joao");
    }

    private static MovimentacaoRequest pedido(int quantidade, String equipamentoId, String observacao) {
        return MovimentacaoRequest.builder().quantidade(quantidade).equipamentoId(equipamentoId).observacao(observacao).build();
    }

    private void preparar() {
        when(itemRepository.buscarParaMovimentar("i1")).thenReturn(Optional.of(item));
        when(usuarioRepository.getReferenceById("u-joao")).thenReturn(joao);
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void entradaSomaAoSaldoEGravaQuemQuandoESaldoApos() {
        preparar();

        var r = service.movimentar("i1", TipoMovimentacao.ENTRADA, pedido(5, null, "  Compra  "), "u-joao");

        assertThat(item.getSaldo()).isEqualTo(15);
        verify(itemRepository).save(item);
        var captor = ArgumentCaptor.forClass(MovimentacaoEstoque.class);
        verify(repository).save(captor.capture());
        var m = captor.getValue();
        assertThat(m.getSaldoApos()).isEqualTo(15);
        assertThat(m.getDataHora()).isEqualTo(AGORA);
        assertThat(m.getUsuario()).isSameAs(joao);
        assertThat(m.getObservacao()).isEqualTo("Compra");
        assertThat(r.usuario()).isEqualTo("João Costa");
        assertThat(r.tipo()).isEqualTo(TipoMovimentacao.ENTRADA);
    }

    @Test
    void retiradaSubtraiELigaAoEquipamento() {
        preparar();
        var equipamento = new Equipamento("HVAC-B", "Ar-condicionado", null, null, "Ala B", null);
        equipamento.setId("e1");
        when(equipamentoRepository.findById("e1")).thenReturn(Optional.of(equipamento));

        var r = service.movimentar("i1", TipoMovimentacao.RETIRADA, pedido(4, "e1", " "), "u-joao");

        assertThat(item.getSaldo()).isEqualTo(6);
        assertThat(r.saldoApos()).isEqualTo(6);
        assertThat(r.equipamento().codigo()).isEqualTo("HVAC-B");
        assertThat(r.observacao()).isNull();
    }

    @Test
    void retiradaPodeZerarOSaldo() {
        preparar();

        service.movimentar("i1", TipoMovimentacao.RETIRADA, pedido(10, null, null), "u-joao");

        assertThat(item.getSaldo()).isZero();
    }

    @Test
    void recusaRetiradaMaiorQueOSaldoSemGravarNada() {
        when(itemRepository.buscarParaMovimentar("i1")).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> service.movimentar("i1", TipoMovimentacao.RETIRADA, pedido(11, null, null), "u-joao"))
                .isInstanceOf(DomainException.class).hasMessage("Saldo insuficiente: há 10 disponível.");
        assertThat(item.getSaldo()).isEqualTo(10);
        verify(itemRepository, never()).save(any());
        verify(repository, never()).save(any());
    }

    @Test
    void recusaEquipamentoInexistente() {
        when(itemRepository.buscarParaMovimentar("i1")).thenReturn(Optional.of(item));
        when(equipamentoRepository.findById("x")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.movimentar("i1", TipoMovimentacao.RETIRADA, pedido(1, "x", null), "u-joao"))
                .isInstanceOf(DomainException.class).hasMessage("Equipamento não encontrado.");
        verify(repository, never()).save(any());
    }

    @Test
    void recusaItemInexistente() {
        when(itemRepository.buscarParaMovimentar("x")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.movimentar("x", TipoMovimentacao.ENTRADA, pedido(1, null, null), "u-joao"))
                .isInstanceOf(DomainException.class).hasMessage("Item não encontrado.");
    }

    @Test
    void historicoDoItemExigeItemExistente() {
        when(itemRepository.existsById("x")).thenReturn(false);

        assertThatThrownBy(() -> service.doItem("x")).isInstanceOf(DomainException.class).hasMessage("Item não encontrado.");
    }

    @Test
    void historicoGeralUsaOPeriodoInclusivoEOsFiltros() {
        var m = new MovimentacaoEstoque();
        m.setItem(item);
        m.setTipo(TipoMovimentacao.RETIRADA);
        m.setQuantidade(1);
        m.setSaldoApos(9);
        m.setDataHora(AGORA);
        m.setUsuario(joao);
        var de = LocalDate.of(2026, 11, 1);
        var ate = LocalDate.of(2026, 11, 30);
        when(repository.buscar(de.atStartOfDay(), ate.plusDays(1).atStartOfDay(), "i1", null, TipoMovimentacao.RETIRADA)).thenReturn(List.of(m));

        var lista = service.buscar(FiltroMovimentacoes.builder().de(de).ate(ate).itemId("i1").equipamentoId("").tipo(TipoMovimentacao.RETIRADA).build());

        assertThat(lista).hasSize(1);
        assertThat(lista.getFirst().item().codigo()).isEqualTo("FLT-01");
        assertThat(lista.getFirst().unidade()).isEqualTo(UnidadeMedida.UN);
    }

    @Test
    void destinosSaoOsEquipamentosEmOrdemDeCodigo() {
        var equipamento = new Equipamento("HVAC-B", "Ar-condicionado", null, null, "Ala B", null);
        equipamento.setId("e1");
        when(equipamentoRepository.findAll(org.springframework.data.domain.Sort.by("codigo"))).thenReturn(List.of(equipamento));

        assertThat(service.destinos()).extracting(r -> r.codigo()).containsExactly("HVAC-B");
    }

    @Test
    void historicoGeralRecusaPeriodoInvalido() {
        var de = LocalDate.of(2026, 11, 1);

        assertThatThrownBy(() -> service.buscar(FiltroMovimentacoes.builder().de(de).ate(de.minusDays(1)).build()))
                .isInstanceOf(DomainException.class).hasMessage("A data final não pode ser antes da inicial.");
        assertThatThrownBy(() -> service.buscar(FiltroMovimentacoes.builder().de(de).ate(de.plusDays(MovimentacaoEstoqueService.MAX_DIAS)).build()))
                .isInstanceOf(DomainException.class).hasMessage("Consulte no máximo 366 dias por vez.");
        verifyNoInteractions(repository);
    }
}
