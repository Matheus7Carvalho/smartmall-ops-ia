package com.smartmall.ops.domain.service.disponibilidade;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Ausencia;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.MotivoAusencia;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.model.disponibilidade.AusenciaRequest;
import com.smartmall.ops.domain.model.disponibilidade.SituacaoFuncionario;
import com.smartmall.ops.domain.repository.ausencia.AusenciaRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisponibilidadeServiceTest {

    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDate HOJE = LocalDate.of(2026, 11, 14);

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EquipeRepository equipeRepository;
    @Mock private TarefaRepository tarefaRepository;
    @Mock private AusenciaRepository ausenciaRepository;

    private DisponibilidadeService service;
    private Usuario ana;
    private Usuario bruno;
    private Usuario carla;
    private Equipe elevadores;

    @BeforeEach
    void setUp() {
        service = new DisponibilidadeService(usuarioRepository, equipeRepository, tarefaRepository, ausenciaRepository,
                Clock.fixed(HOJE.atTime(10, 0).atZone(FUSO).toInstant(), FUSO));
        ana = funcionario("u-ana", "Ana");
        bruno = funcionario("u-bruno", "Bruno");
        carla = funcionario("u-carla", "Carla");
        elevadores = new Equipe("Elevadores", List.of(ana, bruno));
        elevadores.setId("eq-elev");
    }

    private static Usuario funcionario(String id, String nome) {
        var u = new Usuario(nome, id + "@smartmall.local", "h", Perfil.FUNCIONARIO, true);
        u.setId(id);
        return u;
    }

    private Tarefa emExecucao(String id, Usuario responsavel, LocalDateTime quando) {
        var piso = new Piso("L1", "Piso L1", 1);
        var equipamento = new Equipamento("ELV-E1", "Elevador E1", null, piso, "Praça Central", null);
        var programada = new ManutencaoProgramada();
        programada.setEquipamento(equipamento);
        programada.setEquipe(elevadores);
        var t = new Tarefa(programada, quando);
        t.setId(id);
        t.setStatus(StatusTarefa.EM_EXECUCAO);
        t.setResponsavel(responsavel);
        return t;
    }

    private static Ausencia ausencia(String id, Usuario u, LocalDate inicio, LocalDate fim) {
        var a = new Ausencia();
        a.setId(id);
        a.setUsuario(u);
        a.setInicio(inicio);
        a.setFim(fim);
        a.setMotivo(MotivoAusencia.FERIAS);
        return a;
    }

    private void cenario(List<Tarefa> tarefas, List<Ausencia> ausencias) {
        when(equipeRepository.findAll()).thenReturn(List.of(elevadores));
        when(usuarioRepository.findByPerfilAndAtivoTrueOrderByNome(Perfil.FUNCIONARIO)).thenReturn(List.of(ana, bruno, carla));
        when(tarefaRepository.findByStatusAndResponsavelIsNotNullOrderByDataHoraPrevistaAsc(StatusTarefa.EM_EXECUCAO)).thenReturn(tarefas);
        when(ausenciaRepository.findByFimGreaterThanEqualOrderByInicioAsc(HOJE)).thenReturn(ausencias);
    }

    @Test
    void situacaoSegueAusenciaDepoisTarefaDepoisDisponivel() {
        cenario(List.of(emExecucao("t1", ana, HOJE.atTime(8, 0))), List.of(ausencia("a1", bruno, HOJE, HOJE.plusDays(3))));

        var lista = service.hoje();

        assertThat(lista).extracting(f -> f.nome() + ":" + f.situacao())
                .containsExactly("Ana:OCUPADO", "Bruno:INDISPONIVEL", "Carla:DISPONIVEL");
    }

    @Test
    void ausenciaVigenteVenceTarefaEmExecucao() {
        cenario(List.of(emExecucao("t1", ana, HOJE.atTime(8, 0))), List.of(ausencia("a1", ana, HOJE.minusDays(1), HOJE)));

        var a = service.hoje().getFirst();

        assertThat(a.situacao()).isEqualTo(SituacaoFuncionario.INDISPONIVEL);
        assertThat(a.tarefaAtual().id()).isEqualTo("t1");
    }

    @Test
    void ausenciaFuturaNaoTornaIndisponivelMasAparece() {
        cenario(List.of(), List.of(ausencia("a1", carla, HOJE.plusDays(2), HOJE.plusDays(5))));

        var c = service.hoje().get(2);

        assertThat(c.situacao()).isEqualTo(SituacaoFuncionario.DISPONIVEL);
        assertThat(c.ausencia().inicio()).isEqualTo(HOJE.plusDays(2));
    }

    @Test
    void tarefaAtualEhAMaisAntigaEContaTodas() {
        cenario(List.of(emExecucao("t-antiga", ana, HOJE.minusDays(1).atTime(9, 0)), emExecucao("t-nova", ana, HOJE.atTime(9, 0))), List.of());

        var a = service.hoje().getFirst();

        assertThat(a.tarefaAtual().id()).isEqualTo("t-antiga");
        assertThat(a.tarefaAtual().equipamento()).isEqualTo("ELV-E1 · Elevador E1");
        assertThat(a.tarefaAtual().equipe()).isEqualTo("Elevadores");
        assertThat(a.tarefasEmExecucao()).isEqualTo(2);
    }

    @Test
    void listaAsEquipesDeCadaFuncionario() {
        cenario(List.of(), List.of());

        var lista = service.hoje();

        assertThat(lista.getFirst().equipes()).extracting(r -> r.nome()).containsExactly("Elevadores");
        assertThat(lista.get(2).equipes()).isEmpty();
    }

    private static AusenciaRequest pedido(LocalDate inicio, LocalDate fim) {
        return AusenciaRequest.builder().usuarioId("u-ana").inicio(inicio).fim(fim).motivo(MotivoAusencia.FOLGA).build();
    }

    @Test
    void registraAusenciaComOGestor() {
        when(usuarioRepository.findById("u-ana")).thenReturn(Optional.of(ana));
        var gestor = new Usuario();
        gestor.setId("u-gestor");
        when(usuarioRepository.getReferenceById("u-gestor")).thenReturn(gestor);
        when(ausenciaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var salva = service.registrarAusencia(pedido(HOJE, HOJE.plusDays(1)), "u-gestor");

        var captor = ArgumentCaptor.forClass(Ausencia.class);
        verify(ausenciaRepository).save(captor.capture());
        assertThat(captor.getValue().getRegistradaPor()).isSameAs(gestor);
        assertThat(captor.getValue().getUsuario()).isSameAs(ana);
        assertThat(salva.motivo()).isEqualTo(MotivoAusencia.FOLGA);
    }

    @Test
    void rejeitaQuemNaoEhFuncionarioAtivo() {
        var supervisor = new Usuario("Sup", "s@smartmall.local", "h", Perfil.SUPERVISOR, true);
        when(usuarioRepository.findById("u-ana")).thenReturn(Optional.of(supervisor));

        assertThatThrownBy(() -> service.registrarAusencia(pedido(HOJE, HOJE), "g"))
                .isInstanceOf(DomainException.class).hasMessage("Funcionário não encontrado.");
        verify(ausenciaRepository, never()).save(any());
    }

    @Test
    void rejeitaFimAntesDoInicio() {
        when(usuarioRepository.findById("u-ana")).thenReturn(Optional.of(ana));

        assertThatThrownBy(() -> service.registrarAusencia(pedido(HOJE.plusDays(2), HOJE.plusDays(1)), "g"))
                .isInstanceOf(DomainException.class).hasMessage("A data final deve ser igual ou posterior à inicial.");
    }

    @Test
    void rejeitaPeriodoJaPassado() {
        when(usuarioRepository.findById("u-ana")).thenReturn(Optional.of(ana));

        assertThatThrownBy(() -> service.registrarAusencia(pedido(HOJE.minusDays(5), HOJE.minusDays(1)), "g"))
                .isInstanceOf(DomainException.class).hasMessage("Informe um período a partir de hoje.");
    }

    @Test
    void rejeitaPeriodoMaiorQueUmAno() {
        when(usuarioRepository.findById("u-ana")).thenReturn(Optional.of(ana));

        assertThatThrownBy(() -> service.registrarAusencia(pedido(HOJE, HOJE.plusDays(DisponibilidadeService.DIAS_MAXIMOS)), "g"))
                .isInstanceOf(DomainException.class).hasMessage("O período máximo é de um ano.");
    }

    @Test
    void rejeitaPeriodoQueCruzaOutraAusencia() {
        when(usuarioRepository.findById("u-ana")).thenReturn(Optional.of(ana));
        when(ausenciaRepository.existeNoPeriodo("u-ana", HOJE, HOJE.plusDays(2))).thenReturn(true);

        assertThatThrownBy(() -> service.registrarAusencia(pedido(HOJE, HOJE.plusDays(2)), "g"))
                .isInstanceOf(DomainException.class).hasMessage("Já existe ausência registrada nesse período.");
        verify(ausenciaRepository, never()).save(any());
    }

    @Test
    void encerrarAusenciaVigenteTerminaOntem() {
        var a = ausencia("a1", ana, HOJE.minusDays(3), HOJE.plusDays(3));
        when(ausenciaRepository.findById("a1")).thenReturn(Optional.of(a));

        service.encerrarAusencia("a1");

        assertThat(a.getFim()).isEqualTo(HOJE.minusDays(1));
        verify(ausenciaRepository).save(a);
        verify(ausenciaRepository, never()).delete(any(Ausencia.class));
    }

    @Test
    void encerrarAusenciaQueComecaHojeOuDepoisApaga() {
        var a = ausencia("a1", ana, HOJE, HOJE.plusDays(3));
        when(ausenciaRepository.findById("a1")).thenReturn(Optional.of(a));

        service.encerrarAusencia("a1");

        verify(ausenciaRepository).delete(a);
        verify(ausenciaRepository, never()).save(any());
    }

    @Test
    void naoEncerraAusenciaJaTerminada() {
        when(ausenciaRepository.findById("a1")).thenReturn(Optional.of(ausencia("a1", ana, HOJE.minusDays(5), HOJE.minusDays(1))));

        assertThatThrownBy(() -> service.encerrarAusencia("a1"))
                .isInstanceOf(DomainException.class).hasMessage("Esta ausência já terminou.");
    }

    @Test
    void encerrarAusenciaInexistente() {
        when(ausenciaRepository.findById("x")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.encerrarAusencia("x"))
                .isInstanceOf(DomainException.class).hasMessage("Ausência não encontrada.");
    }
}
