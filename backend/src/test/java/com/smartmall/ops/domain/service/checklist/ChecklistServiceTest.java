package com.smartmall.ops.domain.service.checklist;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.ChecklistItem;
import com.smartmall.ops.domain.entity.enums.TipoResposta;
import com.smartmall.ops.domain.repository.checklist.ChecklistRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChecklistServiceTest {

    @Mock
    private ChecklistRepository repository;

    @Mock
    private ManutencaoProgramadaRepository programadaRepository;

    private ChecklistService service;

    @BeforeEach
    void setUp() {
        service = new ChecklistService(repository, programadaRepository);
        lenient().when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private static ChecklistItem item(String pergunta, TipoResposta tipo, Integer max) {
        var item = new ChecklistItem();
        item.setPergunta(pergunta);
        item.setTipoResposta(tipo);
        item.setMaxCaracteres(max);
        return item;
    }

    private static Checklist checklist(String nome, ChecklistItem... itens) {
        return new Checklist(nome, new ArrayList<>(List.of(itens)));
    }

    @Test
    void criaComOsTresTiposDeResposta() {
        var salvo = service.create(checklist("Elevador",
                item("Portas ok?", TipoResposta.SIM_NAO, null),
                item("Desnível (mm)", TipoResposta.NUMERO, null),
                item("Observações", TipoResposta.TEXTO, 500)));

        assertThat(salvo.getItens()).extracting(ChecklistItem::getTipoResposta)
                .containsExactly(TipoResposta.SIM_NAO, TipoResposta.NUMERO, TipoResposta.TEXTO);
        verify(repository).save(salvo);
    }

    @Test
    void numeraItensNaOrdemDaLista() {
        var salvo = service.create(checklist("Elevador",
                item("A", TipoResposta.SIM_NAO, null),
                item("B", TipoResposta.SIM_NAO, null),
                item("C", TipoResposta.SIM_NAO, null)));

        assertThat(salvo.getItens()).extracting(ChecklistItem::getOrdem).containsExactly(1, 2, 3);
    }

    @Test
    void vinculaItensAoChecklist() {
        var salvo = service.create(checklist("Elevador", item("A", TipoResposta.SIM_NAO, null)));

        assertThat(salvo.getItens().getFirst().getChecklist()).isSameAs(salvo);
    }

    @Test
    void removeEspacosDoNomeEDaPergunta() {
        var salvo = service.create(checklist("  Elevador  ", item("  Portas ok?  ", TipoResposta.SIM_NAO, null)));

        assertThat(salvo.getNome()).isEqualTo("Elevador");
        assertThat(salvo.getItens().getFirst().getPergunta()).isEqualTo("Portas ok?");
    }

    @Test
    void itemSemObrigatorioInformadoFicaObrigatorio() {
        var salvo = service.create(checklist("Elevador", item("A", TipoResposta.SIM_NAO, null)));

        assertThat(salvo.getItens().getFirst().getObrigatorio()).isTrue();
    }

    @Test
    void descartaMaximoDeCaracteresForaDoTipoTexto() {
        var salvo = service.create(checklist("Elevador",
                item("Portas ok?", TipoResposta.SIM_NAO, 100),
                item("Desnível", TipoResposta.NUMERO, 20)));

        assertThat(salvo.getItens()).extracting(ChecklistItem::getMaxCaracteres).containsOnlyNulls();
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 200, 500})
    void aceitaMaximoDeCaracteresEntre1e500(int max) {
        var salvo = service.create(checklist("Elevador", item("Obs", TipoResposta.TEXTO, max)));

        assertThat(salvo.getItens().getFirst().getMaxCaracteres()).isEqualTo(max);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 501, -1})
    void rejeitaMaximoDeCaracteresForaDoLimite(int max) {
        assertThatThrownBy(() -> service.create(checklist("Elevador", item("Obs", TipoResposta.TEXTO, max))))
                .isInstanceOf(DomainException.class)
                .hasMessage("Item 1: o máximo de caracteres deve ser entre 1 e 500.");
        verify(repository, never()).save(any());
    }

    @Test
    void textoSemMaximoDeCaracteresEhRejeitado() {
        assertThatThrownBy(() -> service.create(checklist("Elevador",
                item("A", TipoResposta.SIM_NAO, null),
                item("Obs", TipoResposta.TEXTO, null))))
                .isInstanceOf(DomainException.class)
                .hasMessage("Item 2: o máximo de caracteres deve ser entre 1 e 500.");
    }

    @Test
    void rejeitaChecklistSemItens() {
        assertThatThrownBy(() -> service.create(checklist("Elevador")))
                .isInstanceOf(DomainException.class)
                .hasMessage("Adicione pelo menos um item.");
        verify(repository, never()).save(any());
    }

    @Test
    void rejeitaNomeEmBranco() {
        assertThatThrownBy(() -> service.create(checklist("   ", item("A", TipoResposta.SIM_NAO, null))))
                .isInstanceOf(DomainException.class)
                .hasMessage("Informe o nome.");
    }

    @Test
    void rejeitaMaisDe50Itens() {
        var itens = IntStream.rangeClosed(1, 51).mapToObj(i -> item("P" + i, TipoResposta.SIM_NAO, null)).toArray(ChecklistItem[]::new);

        assertThatThrownBy(() -> service.create(checklist("Elevador", itens)))
                .isInstanceOf(DomainException.class)
                .hasMessage("O checklist pode ter até 50 itens.");
    }

    @Test
    void atualizacaoSubstituiNomeEItensNaMesmaColecao() {
        var existente = checklist("Antigo", item("A", TipoResposta.SIM_NAO, null), item("B", TipoResposta.SIM_NAO, null));
        var colecaoGerenciada = existente.getItens();
        when(repository.findById("id-1")).thenReturn(Optional.of(existente));

        var salvo = service.update(checklist("Novo", item("C", TipoResposta.TEXTO, 50)), "id-1");

        assertThat(salvo).isSameAs(existente);
        assertThat(salvo.getNome()).isEqualTo("Novo");
        assertThat(salvo.getItens()).isSameAs(colecaoGerenciada);
        assertThat(salvo.getItens()).extracting(ChecklistItem::getPergunta).containsExactly("C");
        assertThat(salvo.getItens().getFirst().getOrdem()).isEqualTo(1);
        assertThat(salvo.getItens().getFirst().getChecklist()).isSameAs(existente);
    }

    @Test
    void atualizacaoValidaAsRegras() {
        when(repository.findById("id-1")).thenReturn(Optional.of(checklist("Antigo", item("A", TipoResposta.SIM_NAO, null))));

        assertThatThrownBy(() -> service.update(checklist("Novo"), "id-1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Adicione pelo menos um item.");
        verify(repository, never()).save(any());
    }

    @Test
    void atualizarChecklistInexistenteLancaNaoEncontrado() {
        when(repository.findById("x")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(checklist("Novo", item("A", TipoResposta.SIM_NAO, null)), "x"))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
