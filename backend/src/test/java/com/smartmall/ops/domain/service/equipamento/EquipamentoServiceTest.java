package com.smartmall.ops.domain.service.equipamento;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.entity.enums.CategoriaEquipamento;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EquipamentoServiceTest {

    @Mock private EquipamentoRepository repository;
    @Mock private PisoRepository pisoRepository;
    @Mock private ManutencaoProgramadaRepository programadaRepository;
    @Mock private MovimentacaoEstoqueRepository movimentacaoRepository;

    private EquipamentoService service;
    private final Piso l1 = new Piso("L1", "Piso L1", 1);

    @BeforeEach
    void setUp() {
        service = new EquipamentoService(repository, pisoRepository, programadaRepository, movimentacaoRepository);
        l1.setId("p1");
        lenient().when(pisoRepository.findById("p1")).thenReturn(Optional.of(l1));
        lenient().when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private static Equipamento equipamento(String codigo, String pisoId) {
        var piso = new Piso();
        piso.setId(pisoId);
        return new Equipamento(codigo, " Elevador E1 ", CategoriaEquipamento.ELEVADOR, piso, " Praça Central ", CondicaoEquipamento.OPERANDO);
    }

    @Test
    void criaNormalizandoCodigoETextosEResolvendoOPiso() {
        var salvo = service.create(equipamento(" elv-e9 ", "p1"));

        assertThat(salvo.getCodigo()).isEqualTo("ELV-E9");
        assertThat(salvo.getNome()).isEqualTo("Elevador E1");
        assertThat(salvo.getLocalizacao()).isEqualTo("Praça Central");
        assertThat(salvo.getPiso()).isSameAs(l1);
    }

    @Test
    void codigoDuplicadoEhRecusado() {
        when(repository.existeCodigo("ELV-E1", null)).thenReturn(true);

        assertThatThrownBy(() -> service.create(equipamento("ELV-E1", "p1")))
                .isInstanceOf(DomainException.class)
                .hasMessage("Já existe um equipamento com o código ELV-E1.");
        verify(repository, never()).save(any());
    }

    @Test
    void pisoInexistenteEhRecusado() {
        when(pisoRepository.findById("x")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(equipamento("ELV-E9", "x")))
                .isInstanceOf(DomainException.class)
                .hasMessage("Piso não encontrado.");
    }

    @Test
    void edicaoValidaUnicidadeIgnorandoOProprio() {
        var existente = equipamento("ELV-E1", "p1");
        existente.setId("e1");
        when(repository.findById("e1")).thenReturn(Optional.of(existente));
        when(repository.existeCodigo("ELV-E2", "e1")).thenReturn(true);

        assertThatThrownBy(() -> service.update(equipamento("ELV-E2", "p1"), "e1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Já existe um equipamento com o código ELV-E2.");
    }

    @Test
    void edicaoMantendoOProprioCodigoEhAceita() {
        var existente = equipamento("ELV-E1", "p1");
        existente.setId("e1");
        when(repository.findById("e1")).thenReturn(Optional.of(existente));
        when(repository.existeCodigo("ELV-E1", "e1")).thenReturn(false);

        assertThat(service.update(equipamento("ELV-E1", "p1"), "e1").getId()).isEqualTo("e1");
    }

    @Test
    void equipamentoComPlanoNaoPodeSerExcluido() {
        when(programadaRepository.existsByEquipamentoId("e1")).thenReturn(true);

        assertThatThrownBy(() -> service.delete("e1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Equipamento com manutenção programada não pode ser excluído.");
        verify(repository, never()).deleteById(any());
    }

    @Test
    void equipamentoSemPlanoEhExcluido() {
        when(programadaRepository.existsByEquipamentoId("e1")).thenReturn(false);

        service.delete("e1");

        verify(repository).deleteById("e1");
    }

    @Test
    void equipamentoComMovimentacaoDeEstoqueNaoPodeSerExcluido() {
        when(programadaRepository.existsByEquipamentoId("e1")).thenReturn(false);
        when(movimentacaoRepository.existsByEquipamentoId("e1")).thenReturn(true);

        assertThatThrownBy(() -> service.delete("e1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Equipamento com movimentações de estoque não pode ser excluído.");
        verify(repository, never()).deleteById(any());
    }
}
