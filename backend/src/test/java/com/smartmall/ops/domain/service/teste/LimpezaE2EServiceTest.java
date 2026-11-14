package com.smartmall.ops.domain.service.teste;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.repository.arquivo.ArquivoRepository;
import com.smartmall.ops.domain.repository.estoque.ItemEstoqueRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaEvidenciaRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import com.smartmall.ops.domain.entity.ItemEstoque;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LimpezaE2EServiceTest {

    @Mock private ManutencaoProgramadaRepository programadaRepository;
    @Mock private TarefaRepository tarefaRepository;
    @Mock private TarefaEvidenciaRepository evidenciaRepository;
    @Mock private ArquivoRepository arquivoRepository;
    @Mock private ItemEstoqueRepository itemRepository;
    @Mock private MovimentacaoEstoqueRepository movimentacaoRepository;

    private LimpezaE2EService service;

    @BeforeEach
    void setUp() {
        service = new LimpezaE2EService(programadaRepository, tarefaRepository, evidenciaRepository, arquivoRepository, itemRepository, movimentacaoRepository);
    }

    @Test
    void apagaTarefasArquivosEManutencaoProgramadaDaMarca() {
        var programada = new ManutencaoProgramada();
        programada.setId("p1");
        when(programadaRepository.findByObservacoes("E2E-AB12CD34")).thenReturn(List.of(programada));
        when(evidenciaRepository.arquivosDaProgramada("p1")).thenReturn(List.of("a1", "a2"));

        assertThat(service.excluirMarcados("E2E-AB12CD34")).isEqualTo(1);

        // Os arquivos só saem depois das evidências (chave estrangeira), que caem junto com as tarefas.
        InOrder ordem = inOrder(tarefaRepository, arquivoRepository, programadaRepository);
        ordem.verify(tarefaRepository).excluirDaProgramada("p1");
        ordem.verify(arquivoRepository).deleteAllByIdInBatch(List.of("a1", "a2"));
        ordem.verify(programadaRepository).delete(programada);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "E2E-", "e2e-ab12cd34", "Revisão anual", "E2E-AB12%"})
    void recusaMarcaQueNaoSejaDeTeste(String marca) {
        assertThatThrownBy(() -> service.excluirMarcados(marca))
                .isInstanceOf(DomainException.class)
                .hasMessage("Marca de teste inválida.");
        verifyNoInteractions(programadaRepository, tarefaRepository, arquivoRepository);
    }

    @Test
    void apagaItensDeEstoqueComAMarcaNoCodigoEAsMovimentacoes() {
        var item = new ItemEstoque();
        item.setId("i1");
        when(programadaRepository.findByObservacoes("E2E-AB12CD34")).thenReturn(List.of());
        when(itemRepository.findByCodigo("E2E-AB12CD34")).thenReturn(List.of(item));

        service.excluirMarcados("E2E-AB12CD34");

        InOrder ordem = inOrder(movimentacaoRepository, itemRepository);
        ordem.verify(movimentacaoRepository).excluirDoItem("i1");
        ordem.verify(itemRepository).delete(item);
        verify(itemRepository).findByCodigo("E2E-AB12CD34");
    }
}
