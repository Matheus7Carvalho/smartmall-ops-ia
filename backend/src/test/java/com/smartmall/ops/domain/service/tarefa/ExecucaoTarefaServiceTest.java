package com.smartmall.ops.domain.service.tarefa;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.ChecklistItem;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.TarefaEvidencia;
import com.smartmall.ops.domain.entity.TarefaItem;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.entity.enums.TipoResposta;
import com.smartmall.ops.domain.model.tarefa.Ator;
import com.smartmall.ops.domain.model.tarefa.AvaliacaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.ExecucaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.RespostaItemRequest;
import com.smartmall.ops.domain.repository.tarefa.TarefaEvidenciaRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class ExecucaoTarefaServiceTest {

    private static final ZoneId FUSO = ZoneId.of("America/Araguaina");
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0};

    private static final Ator MEMBRO = new Ator("u-membro", Perfil.FUNCIONARIO);
    private static final Ator OUTRO_MEMBRO = new Ator("u-outro", Perfil.FUNCIONARIO);
    private static final Ator DE_FORA = new Ator("u-fora", Perfil.FUNCIONARIO);
    private static final Ator SUPERVISOR = new Ator("u-sup", Perfil.SUPERVISOR);

    @Mock private TarefaRepository repository;
    @Mock private TarefaEvidenciaRepository evidenciaRepository;
    @Mock private UsuarioRepository usuarioRepository;

    private ExecucaoTarefaService service;
    private Tarefa tarefa;
    private final List<TarefaEvidencia> evidencias = new ArrayList<>();

    @BeforeEach
    void setUp() {
        service = new ExecucaoTarefaService(repository, evidenciaRepository, usuarioRepository,
                Clock.fixed(AGORA.atZone(FUSO).toInstant(), FUSO));

        var checklist = new Checklist("Elevador", List.of(
                item(1, "Freios ok?", TipoResposta.SIM_NAO, true, null),
                item(2, "Desnível (mm)", TipoResposta.NUMERO, true, null),
                item(3, "Observações", TipoResposta.TEXTO, false, 10)));
        checklist.setId("ck");
        var equipe = new Equipe("Elevadores", List.of(usuario(MEMBRO), usuario(OUTRO_MEMBRO)));
        equipe.setId("eqp");
        var equipamento = new Equipamento("ELV-E1", "Elevador E1", null, new Piso("L1", "Piso L1", 1), "Praça", null);
        equipamento.setId("eq");
        var programada = new ManutencaoProgramada();
        programada.setId("prog");
        programada.setEquipamento(equipamento);
        programada.setChecklist(checklist);
        programada.setEquipe(equipe);
        programada.setDuracaoMinutos(60);
        programada.setAtivo(true);
        tarefa = new Tarefa(programada, AGORA.minusHours(2));
        tarefa.setId("t1");

        lenient().when(repository.buscarParaAlterar("t1")).thenReturn(Optional.of(tarefa));
        lenient().when(repository.findById("t1")).thenReturn(Optional.of(tarefa));
        lenient().when(usuarioRepository.getReferenceById(anyString())).thenAnswer(inv -> usuario(new Ator(inv.getArgument(0), Perfil.FUNCIONARIO)));
        lenient().when(evidenciaRepository.findByTarefaIdOrderByDataCriacaoAsc("t1")).thenAnswer(inv -> List.copyOf(evidencias));
        lenient().when(evidenciaRepository.countByTarefaId("t1")).thenAnswer(inv -> (long) evidencias.size());
        lenient().when(evidenciaRepository.countByTarefaIdAndEnvioIsNull("t1"))
                .thenAnswer(inv -> evidencias.stream().filter(e -> e.getEnvio() == null).count());
        lenient().when(evidenciaRepository.save(any())).thenAnswer(inv -> {
            TarefaEvidencia e = inv.getArgument(0);
            e.setId("ev" + evidencias.size());
            evidencias.add(e);
            return e;
        });
        lenient().when(evidenciaRepository.findByIdAndTarefaId(anyString(), any()))
                .thenAnswer(inv -> evidencias.stream().filter(e -> e.getId().equals(inv.getArgument(0))).findFirst());
    }

    private static ChecklistItem item(int ordem, String pergunta, TipoResposta tipo, boolean obrigatorio, Integer max) {
        var item = new ChecklistItem(null, ordem, pergunta, tipo, obrigatorio, max);
        item.setId("modelo-" + ordem);
        return item;
    }

    private static Usuario usuario(Ator ator) {
        var u = new Usuario("Nome " + ator.id(), ator.id() + "@smartmall.local", "h", ator.perfil(), true);
        u.setId(ator.id());
        return u;
    }

    /** Tarefa assumida pelo MEMBRO, com ids nos itens (o flush do JPA os geraria). */
    private void emExecucao() {
        service.assumir("t1", MEMBRO);
        for (int i = 0; i < tarefa.getItens().size(); i++) tarefa.getItens().get(i).setId("i" + (i + 1));
    }

    private static ExecucaoTarefaRequest respostas(String observacao, Map<String, String> respostas) {
        var lista = respostas.entrySet().stream().map(e -> new RespostaItemRequest(e.getKey(), e.getValue())).toList();
        return new ExecucaoTarefaRequest(observacao, new ArrayList<>(lista));
    }

    private static ExecucaoTarefaRequest completas() {
        return respostas("Tudo certo", Map.of("i1", "SIM", "i2", "3"));
    }

    // ---- assumir

    @Test
    void membroAssumeCopiandoOChecklistEGravandoHistorico() {
        var detalhe = service.assumir("t1", MEMBRO);

        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.EM_EXECUCAO);
        assertThat(tarefa.getResponsavel().getId()).isEqualTo("u-membro");
        assertThat(tarefa.getItens()).extracting(TarefaItem::getPergunta).containsExactly("Freios ok?", "Desnível (mm)", "Observações");
        assertThat(tarefa.getHistorico()).singleElement().satisfies(h -> {
            assertThat(h.getAcao()).isEqualTo(AcaoTarefa.ASSUMIDA);
            assertThat(h.getUsuario().getId()).isEqualTo("u-membro");
            assertThat(h.getDataHora()).isEqualTo(AGORA);
            assertThat(h.getStatusResultante()).isEqualTo(StatusTarefa.EM_EXECUCAO);
        });
        assertThat(detalhe.getAcoes().isExecutar()).isTrue();
        assertThat(detalhe.getAcoes().isAssumir()).isFalse();
    }

    @Test
    void funcionarioDeOutraEquipeNemVeATarefa() {
        assertThatThrownBy(() -> service.assumir("t1", DE_FORA)).isInstanceOf(EntityNotFoundException.class);
        assertThatThrownBy(() -> service.detalhe("t1", DE_FORA)).isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void supervisorNaoAssumePorNaoSerMembro() {
        assertThatThrownBy(() -> service.assumir("t1", SUPERVISOR))
                .isInstanceOf(DomainException.class)
                .hasMessage("Só membros da equipe Elevadores podem assumir esta tarefa.");
    }

    @Test
    void naoAssumeTarefaJaAssumida() {
        service.assumir("t1", MEMBRO);

        assertThatThrownBy(() -> service.assumir("t1", OUTRO_MEMBRO))
                .isInstanceOf(DomainException.class)
                .hasMessage("Só tarefas agendadas podem ser assumidas.");
        assertThat(tarefa.getResponsavel().getId()).isEqualTo("u-membro");
    }

    @Test
    void antesDeAssumirMostraOsItensDoModeloSemResposta() {
        var detalhe = service.detalhe("t1", OUTRO_MEMBRO);

        assertThat(detalhe.getItens()).extracting(i -> i.getPergunta()).containsExactly("Freios ok?", "Desnível (mm)", "Observações");
        assertThat(detalhe.getAcoes().isAssumir()).isTrue();
        assertThat(detalhe.getAcoes().isExecutar()).isFalse();
    }

    // ---- respostas

    @Test
    void salvaRespostasNormalizadasEObservacao() {
        emExecucao();

        service.salvar("t1", respostas("  Troquei o sensor  ", Map.of("i1", "NAO", "i2", "12,50", "i3", " ok ")), MEMBRO);

        assertThat(tarefa.getItens()).extracting(TarefaItem::getResposta).containsExactly("NAO", "12.5", "ok");
        assertThat(tarefa.getObservacao()).isEqualTo("Troquei o sensor");
        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.EM_EXECUCAO);
    }

    @Test
    void respostaVaziaApagaAResposta() {
        emExecucao();
        service.salvar("t1", respostas(null, Map.of("i1", "SIM")), MEMBRO);

        service.salvar("t1", respostas(null, Map.of("i1", "  ")), MEMBRO);

        assertThat(tarefa.getItens().getFirst().getResposta()).isNull();
    }

    @Test
    void rejeitaRespostasForaDoTipo() {
        emExecucao();

        assertThatThrownBy(() -> service.salvar("t1", respostas(null, Map.of("i1", "talvez")), MEMBRO))
                .hasMessage("Responda Sim ou Não: Freios ok?");
        assertThatThrownBy(() -> service.salvar("t1", respostas(null, Map.of("i2", "dez")), MEMBRO))
                .hasMessage("Informe um número: Desnível (mm)");
        assertThatThrownBy(() -> service.salvar("t1", respostas(null, Map.of("i2", "1e12")), MEMBRO))
                .hasMessage("Número fora do limite: Desnível (mm)");
        assertThatThrownBy(() -> service.salvar("t1", respostas(null, Map.of("i3", "12345678901")), MEMBRO))
                .hasMessage("No máximo 10 caracteres: Observações");
        assertThatThrownBy(() -> service.salvar("t1", respostas(null, Map.of("outro", "SIM")), MEMBRO))
                .hasMessage("Item do checklist não encontrado.");
    }

    @Test
    void soOResponsavelExecuta() {
        emExecucao();

        assertThatThrownBy(() -> service.salvar("t1", completas(), OUTRO_MEMBRO))
                .isInstanceOf(DomainException.class)
                .hasMessage("Só o responsável pela tarefa pode executá-la.");
        assertThatThrownBy(() -> service.adicionarEvidencia("t1", "a.png", PNG, SUPERVISOR))
                .hasMessage("Só o responsável pela tarefa pode executá-la.");
    }

    // ---- evidências

    @Test
    void anexaImagemIdentificandoOTipoPeloConteudo() {
        emExecucao();

        var detalhe = service.adicionarEvidencia("t1", "C:\\fotos\\painel.jpg", JPEG, MEMBRO);

        assertThat(detalhe.getEvidencias()).singleElement().satisfies(e -> {
            assertThat(e.getNomeArquivo()).isEqualTo("painel.jpg");
            assertThat(e.getTipoConteudo()).isEqualTo("image/jpeg");
            assertThat(e.getEnvio()).isNull();
            assertThat(e.getEnviadaPor().getId()).isEqualTo("u-membro");
        });
    }

    @Test
    void rejeitaArquivoQueNaoEhImagemOuGrandeDemais() {
        emExecucao();

        assertThatThrownBy(() -> service.adicionarEvidencia("t1", "foto.png", "%PDF-1.7".getBytes(), MEMBRO))
                .hasMessage("Envie uma imagem JPG, PNG ou WebP.");
        var grande = new byte[ExecucaoTarefaService.MAX_BYTES_EVIDENCIA + 1];
        System.arraycopy(PNG, 0, grande, 0, PNG.length);
        assertThatThrownBy(() -> service.adicionarEvidencia("t1", "foto.png", grande, MEMBRO))
                .hasMessage("A imagem deve ter no máximo 5 MB.");
        assertThatThrownBy(() -> service.adicionarEvidencia("t1", "vazio.png", new byte[0], MEMBRO))
                .hasMessage("Selecione uma imagem.");
        assertThat(evidencias).isEmpty();
    }

    @Test
    void limitaImagensPorEnvio() {
        emExecucao();
        for (int i = 0; i < ExecucaoTarefaService.MAX_EVIDENCIAS_POR_ENVIO; i++) service.adicionarEvidencia("t1", "f.png", PNG, MEMBRO);

        assertThatThrownBy(() -> service.adicionarEvidencia("t1", "f.png", PNG, MEMBRO))
                .hasMessage("Cada envio aceita até 10 imagens.");
    }

    @Test
    void removeEvidenciaPendenteMasNaoAJaEnviada() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);
        service.enviar("t1", completas(), MEMBRO);
        service.reprovar("t1", new AvaliacaoTarefaRequest("Foto escura"), SUPERVISOR);
        service.adicionarEvidencia("t1", "b.png", PNG, MEMBRO);

        assertThatThrownBy(() -> service.removerEvidencia("t1", "ev0", MEMBRO))
                .hasMessage("Evidência já enviada para análise não pode ser removida.");

        service.removerEvidencia("t1", "ev1", MEMBRO);
        org.mockito.Mockito.verify(evidenciaRepository).delete(evidencias.get(1));
    }

    @Test
    void nomeDoArquivoPerdeCaminhoEFicaNoLimite() {
        assertThat(ExecucaoTarefaService.nomeSeguro("/tmp/../x/foto.png")).isEqualTo("foto.png");
        assertThat(ExecucaoTarefaService.nomeSeguro("  ")).isEqualTo("evidencia");
        assertThat(ExecucaoTarefaService.nomeSeguro("a".repeat(200) + ".png")).hasSize(150).endsWith(".png");
    }

    // ---- enviar

    @Test
    void enviaParaAnaliseLigandoEvidenciasAoEnvio() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);

        var detalhe = service.enviar("t1", completas(), MEMBRO);

        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.EM_ANALISE);
        assertThat(tarefa.getEnvios()).isEqualTo(1);
        assertThat(tarefa.getUltimoEnvio()).isEqualTo(AGORA);
        assertThat(evidencias).extracting(TarefaEvidencia::getEnvio).containsExactly(1);
        assertThat(tarefa.getHistorico().getLast()).satisfies(h -> {
            assertThat(h.getAcao()).isEqualTo(AcaoTarefa.ENVIADA);
            assertThat(h.getObservacao()).isEqualTo("Tudo certo");
            assertThat(h.getEnvio()).isEqualTo(1);
        });
        assertThat(detalhe.getAcoes().isExecutar()).isFalse();
    }

    @Test
    void enviarExigeObrigatoriosRespondidos() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);

        assertThatThrownBy(() -> service.enviar("t1", respostas(null, Map.of("i1", "SIM")), MEMBRO))
                .hasMessage("Responda: Desnível (mm)");
        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.EM_EXECUCAO);
    }

    @Test
    void enviarExigeAoMenosUmaImagem() {
        emExecucao();

        assertThatThrownBy(() -> service.enviar("t1", completas(), MEMBRO))
                .hasMessage("Anexe ao menos uma imagem como evidência.");
    }

    @Test
    void reenvioExigeImagemNova() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);
        service.enviar("t1", completas(), MEMBRO);
        service.reprovar("t1", new AvaliacaoTarefaRequest("Foto escura"), SUPERVISOR);

        assertThatThrownBy(() -> service.enviar("t1", completas(), MEMBRO))
                .hasMessage("Anexe ao menos uma imagem nova para reenviar.");

        service.adicionarEvidencia("t1", "b.png", PNG, MEMBRO);
        service.enviar("t1", completas(), MEMBRO);
        assertThat(evidencias).extracting(TarefaEvidencia::getEnvio).containsExactly(1, 2);
        assertThat(tarefa.getEnvios()).isEqualTo(2);
    }

    @Test
    void emAnaliseNaoPodeSerAlterada() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);
        service.enviar("t1", completas(), MEMBRO);

        assertThatThrownBy(() -> service.adicionarEvidencia("t1", "b.png", PNG, MEMBRO))
                .hasMessage("A tarefa está em análise e não pode ser alterada.");
    }

    // ---- avaliar

    @Test
    void supervisorAprovaEConclui() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);
        service.enviar("t1", completas(), MEMBRO);

        var detalhe = service.aprovar("t1", new AvaliacaoTarefaRequest(" "), SUPERVISOR);

        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.CONCLUIDA);
        assertThat(tarefa.getHistorico().getLast()).satisfies(h -> {
            assertThat(h.getAcao()).isEqualTo(AcaoTarefa.APROVADA);
            assertThat(h.getUsuario().getId()).isEqualTo("u-sup");
            assertThat(h.getObservacao()).isNull();
        });
        assertThat(detalhe.getAcoes().isAvaliar()).isFalse();
    }

    @Test
    void reprovarVoltaParaExecucaoComOMesmoResponsavel() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);
        service.enviar("t1", completas(), MEMBRO);

        service.reprovar("t1", new AvaliacaoTarefaRequest("Foto escura"), SUPERVISOR);

        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.EM_EXECUCAO);
        assertThat(tarefa.getResponsavel().getId()).isEqualTo("u-membro");
        assertThat(tarefa.getHistorico()).extracting(h -> h.getAcao())
                .containsExactly(AcaoTarefa.ASSUMIDA, AcaoTarefa.ENVIADA, AcaoTarefa.REPROVADA);
        assertThat(tarefa.getHistorico().getLast().getObservacao()).isEqualTo("Foto escura");
        assertThat(tarefa.getItens().getFirst().getResposta()).isEqualTo("SIM");
    }

    @Test
    void reprovarExigeMotivo() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);
        service.enviar("t1", completas(), MEMBRO);

        assertThatThrownBy(() -> service.reprovar("t1", new AvaliacaoTarefaRequest("  "), SUPERVISOR))
                .hasMessage("Informe o motivo da reprovação.");
        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.EM_ANALISE);
    }

    @Test
    void soAvaliaTarefaEmAnaliseESoGestao() {
        emExecucao();

        assertThatThrownBy(() -> service.aprovar("t1", new AvaliacaoTarefaRequest(), SUPERVISOR))
                .hasMessage("Só tarefas em análise podem ser aprovadas.");
        assertThatThrownBy(() -> service.aprovar("t1", new AvaliacaoTarefaRequest(), MEMBRO))
                .hasMessage("Só Administrador ou Supervisor avalia tarefas.");
    }

    @Test
    void imagemSoParaQuemVeATarefa() {
        emExecucao();
        service.adicionarEvidencia("t1", "a.png", PNG, MEMBRO);
        evidencias.getFirst().setArquivo(new com.smartmall.ops.domain.entity.Arquivo(PNG));

        assertThat(service.arquivo("t1", "ev0", SUPERVISOR).tipoConteudo()).isEqualTo("image/png");
        assertThatThrownBy(() -> service.arquivo("t1", "ev0", DE_FORA)).isInstanceOf(EntityNotFoundException.class);
    }
}
