package com.smartmall.ops.domain.service.estoque;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.ItemEstoque;
import com.smartmall.ops.domain.entity.enums.CategoriaItemEstoque;
import com.smartmall.ops.domain.entity.enums.UnidadeMedida;
import com.smartmall.ops.domain.repository.estoque.ItemEstoqueRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ItemEstoqueServiceTest {

    @Mock private ItemEstoqueRepository repository;
    @Mock private MovimentacaoEstoqueRepository movimentacaoRepository;

    private ItemEstoqueService service;

    @BeforeEach
    void setUp() {
        service = new ItemEstoqueService(repository, movimentacaoRepository);
    }

    private static ItemEstoque item(String codigo) {
        var i = new ItemEstoque();
        i.setCodigo(codigo);
        i.setNome("  Filtro G4 ");
        i.setCategoria(CategoriaItemEstoque.PECA);
        i.setUnidade(UnidadeMedida.UN);
        i.setEstoqueMinimo(10);
        i.setDescricao("   ");
        i.setLocalizacao(" Prateleira 2 ");
        return i;
    }

    @Test
    void criaComSaldoZeroETextosNormalizados() {
        var novo = item(" flt-01 ");
        novo.setSaldo(99);
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var salvo = service.create(novo);

        assertThat(salvo.getSaldo()).isZero();
        assertThat(salvo.getCodigo()).isEqualTo("FLT-01");
        assertThat(salvo.getNome()).isEqualTo("Filtro G4");
        assertThat(salvo.getDescricao()).isNull();
        assertThat(salvo.getLocalizacao()).isEqualTo("Prateleira 2");
    }

    @Test
    void rejeitaCodigoDuplicado() {
        when(repository.existeCodigo("FLT-01", null)).thenReturn(true);

        assertThatThrownBy(() -> service.create(item("flt-01")))
                .isInstanceOf(DomainException.class).hasMessage("Já existe um item com o código FLT-01.");
        verify(repository, never()).save(any());
    }

    @Test
    void edicaoNaoAlteraOSaldo() {
        var existente = item("FLT-01");
        existente.setId("i1");
        existente.setSaldo(26);
        when(repository.findById("i1")).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
        var alteracao = item("FLT-01");
        alteracao.setEstoqueMinimo(5);
        alteracao.setSaldo(0);

        var salvo = service.update(alteracao, "i1");

        assertThat(salvo.getSaldo()).isEqualTo(26);
        assertThat(salvo.getEstoqueMinimo()).isEqualTo(5);
    }

    @Test
    void itemComMovimentacoesNaoPodeSerExcluido() {
        when(movimentacaoRepository.existsByItemId("i1")).thenReturn(true);

        assertThatThrownBy(() -> service.delete("i1"))
                .isInstanceOf(DomainException.class).hasMessage("Item com movimentações não pode ser excluído.");
        verify(repository, never()).deleteById(any());
    }

    @Test
    void itemSemMovimentacoesEhExcluido() {
        when(movimentacaoRepository.existsByItemId("i1")).thenReturn(false);

        service.delete("i1");

        verify(repository).deleteById("i1");
    }
}
