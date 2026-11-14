package com.smartmall.ops.domain.service.tarefa;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.service.chamado.CicloChamadoService;
import com.smartmall.ops.domain.entity.Arquivo;
import com.smartmall.ops.domain.entity.ChecklistItem;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.TarefaEvidencia;
import com.smartmall.ops.domain.entity.TarefaItem;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.model.tarefa.ArquivoEvidencia;
import com.smartmall.ops.domain.model.tarefa.Ator;
import com.smartmall.ops.domain.model.tarefa.AvaliacaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.ExecucaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.RespostaItemRequest;
import com.smartmall.ops.domain.model.tarefa.TarefaDetalheResponse;
import com.smartmall.ops.domain.model.tarefa.TarefaResponse;
import com.smartmall.ops.domain.repository.tarefa.TarefaEvidenciaRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Regras em docs/modulo-manutencao.md, seção "Execução e validação". */
@Service
@Transactional(readOnly = true)
public class ExecucaoTarefaService implements IExecucaoTarefaService {

    public static final int MAX_BYTES_EVIDENCIA = 5 * 1024 * 1024;
    public static final int MAX_EVIDENCIAS_POR_ENVIO = 10;
    public static final int MAX_EVIDENCIAS_POR_TAREFA = 30;
    public static final int MAX_NOME_ARQUIVO = 150;
    private static final BigDecimal MAX_NUMERO = new BigDecimal("999999999");

    private final TarefaRepository repository;
    private final TarefaEvidenciaRepository evidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final Clock clock;
    private final CicloChamadoService cicloChamado;

    public ExecucaoTarefaService(TarefaRepository repository, TarefaEvidenciaRepository evidenciaRepository,
                                 UsuarioRepository usuarioRepository, Clock clock) {
        this(repository, evidenciaRepository, usuarioRepository, clock, null);
    }

    @Autowired
    public ExecucaoTarefaService(TarefaRepository repository, TarefaEvidenciaRepository evidenciaRepository,
                                 UsuarioRepository usuarioRepository, Clock clock, CicloChamadoService cicloChamado) {
        this.repository = repository;
        this.evidenciaRepository = evidenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.clock = clock;
        this.cicloChamado = cicloChamado;
    }

    private LocalDateTime agora() {
        return LocalDateTime.now(clock);
    }

    @Override
    public TarefaDetalheResponse detalhe(String id, Ator ator) {
        var tarefa = repository.findById(id).orElseThrow(TarefaService::naoEncontrada);
        exigirAcesso(tarefa, ator);
        return montar(tarefa, ator);
    }

    @Override
    public List<TarefaResponse> emAnalise() {
        var agora = agora();
        return repository.findByStatusOrderByUltimoEnvioAsc(StatusTarefa.EM_ANALISE).stream()
                .map(t -> TarefaResponse.de(t, agora))
                .toList();
    }

    @Override
    @Transactional
    public TarefaDetalheResponse assumir(String id, Ator ator) {
        var tarefa = paraAlterar(id);
        exigirAcesso(tarefa, ator);
        if (tarefa.getStatus() != StatusTarefa.AGENDADA) {
            throw new DomainException("Só tarefas agendadas podem ser assumidas.");
        }
        if (!membro(tarefa, ator)) {
            throw new DomainException("Só membros da equipe %s podem assumir esta tarefa.", tarefa.equipeEfetiva().getNome());
        }
        tarefa.setResponsavel(usuarioRepository.getReferenceById(ator.id()));
        tarefa.getItens().clear();
        if (tarefa.checklistEfetivo() != null) {
            tarefa.checklistEfetivo().getItens().stream()
                    .sorted(Comparator.comparing(ChecklistItem::getOrdem))
                    .forEach(modelo -> tarefa.getItens().add(TarefaItem.copiaDe(modelo, tarefa)));
        }
        tarefa.mudarStatus(StatusTarefa.EM_EXECUCAO, AcaoTarefa.ASSUMIDA, tarefa.getResponsavel(), agora(), null);
        if (cicloChamado != null) cicloChamado.iniciada(tarefa, ator.id());
        return montar(gravar(tarefa), ator);
    }

    @Override
    @Transactional
    public TarefaDetalheResponse salvar(String id, ExecucaoTarefaRequest request, Ator ator) {
        var tarefa = paraExecutar(id, ator);
        aplicar(tarefa, request);
        return montar(gravar(tarefa), ator);
    }

    @Override
    @Transactional
    public TarefaDetalheResponse adicionarEvidencia(String id, String nomeArquivo, byte[] conteudo, Ator ator) {
        var tarefa = paraExecutar(id, ator);
        if (conteudo == null || conteudo.length == 0) throw new DomainException("Selecione uma imagem.");
        if (conteudo.length > MAX_BYTES_EVIDENCIA) throw new DomainException("A imagem deve ter no máximo 5 MB.");
        var tipo = TipoImagem.detectar(conteudo).orElseThrow(() -> new DomainException("Envie uma imagem JPG, PNG ou WebP."));
        if (evidenciaRepository.countByTarefaIdAndEnvioIsNull(id) >= MAX_EVIDENCIAS_POR_ENVIO) {
            throw new DomainException("Cada envio aceita até %d imagens.", MAX_EVIDENCIAS_POR_ENVIO);
        }
        if (evidenciaRepository.countByTarefaId(id) >= MAX_EVIDENCIAS_POR_TAREFA) {
            throw new DomainException("A tarefa já tem o máximo de %d imagens.", MAX_EVIDENCIAS_POR_TAREFA);
        }
        var evidencia = new TarefaEvidencia();
        evidencia.setTarefa(tarefa);
        evidencia.setArquivo(new Arquivo(conteudo));
        evidencia.setNomeArquivo(nomeSeguro(nomeArquivo));
        evidencia.setTipoConteudo(tipo.tipoConteudo);
        evidencia.setTamanhoBytes(conteudo.length);
        evidencia.setEnviadaPor(tarefa.getResponsavel());
        evidenciaRepository.save(evidencia);
        return montar(tarefa, ator);
    }

    @Override
    @Transactional
    public TarefaDetalheResponse removerEvidencia(String id, String evidenciaId, Ator ator) {
        var tarefa = paraExecutar(id, ator);
        var evidencia = evidenciaRepository.findByIdAndTarefaId(evidenciaId, id)
                .orElseThrow(() -> new EntityNotFoundException("Evidência não encontrada."));
        if (evidencia.getEnvio() != null) {
            throw new DomainException("Evidência já enviada para análise não pode ser removida.");
        }
        evidenciaRepository.delete(evidencia);
        return montar(tarefa, ator);
    }

    @Override
    public ArquivoEvidencia arquivo(String id, String evidenciaId, Ator ator) {
        var tarefa = repository.findById(id).orElseThrow(TarefaService::naoEncontrada);
        exigirAcesso(tarefa, ator);
        var evidencia = evidenciaRepository.findByIdAndTarefaId(evidenciaId, id)
                .orElseThrow(() -> new EntityNotFoundException("Evidência não encontrada."));
        return new ArquivoEvidencia(evidencia.getNomeArquivo(), evidencia.getTipoConteudo(), evidencia.getArquivo().getConteudo());
    }

    @Override
    @Transactional
    public TarefaDetalheResponse enviar(String id, ExecucaoTarefaRequest request, Ator ator) {
        var tarefa = paraExecutar(id, ator);
        aplicar(tarefa, request);
        for (TarefaItem item : tarefa.getItens()) {
            if (Boolean.TRUE.equals(item.getObrigatorio()) && item.getResposta() == null) {
                throw new DomainException("Responda: %s", item.getPergunta());
            }
        }
        var pendentes = evidenciaRepository.findByTarefaIdOrderByDataCriacaoAsc(id).stream().filter(e -> e.getEnvio() == null).toList();
        if (tarefa.getPlanoAcao() != null && (tarefa.getObservacao() == null || tarefa.getObservacao().isBlank()))
            throw new DomainException("Registre a resolução do chamado.");
        if (pendentes.isEmpty() && tarefa.getProgramada() != null) {
            throw new DomainException(tarefa.getEnvios() == 0
                    ? "Anexe ao menos uma imagem como evidência."
                    : "Anexe ao menos uma imagem nova para reenviar.");
        }
        var agora = agora();
        int envio = tarefa.getEnvios() + 1;
        tarefa.setEnvios(envio);
        tarefa.setUltimoEnvio(agora);
        pendentes.forEach(e -> e.setEnvio(envio));
        tarefa.mudarStatus(StatusTarefa.EM_ANALISE, AcaoTarefa.ENVIADA, tarefa.getResponsavel(), agora, tarefa.getObservacao())
                .setEnvio(envio);
        return montar(gravar(tarefa), ator);
    }

    @Override
    @Transactional
    public TarefaDetalheResponse aprovar(String id, AvaliacaoTarefaRequest request, Ator ator) {
        var tarefa = paraAvaliar(id, ator, "aprovadas");
        tarefa.mudarStatus(StatusTarefa.CONCLUIDA, AcaoTarefa.APROVADA, usuarioRepository.getReferenceById(ator.id()), agora(),
                texto(request.getObservacao()));
        if (cicloChamado != null) cicloChamado.encerrada(tarefa, ator.id());
        return montar(gravar(tarefa), ator);
    }

    /** Volta para execução com o mesmo responsável. */
    @Override
    @Transactional
    public TarefaDetalheResponse reprovar(String id, AvaliacaoTarefaRequest request, Ator ator) {
        var tarefa = paraAvaliar(id, ator, "reprovadas");
        var motivo = texto(request.getObservacao());
        if (motivo == null) throw new DomainException("Informe o motivo da reprovação.");
        tarefa.mudarStatus(StatusTarefa.EM_EXECUCAO, AcaoTarefa.REPROVADA, usuarioRepository.getReferenceById(ator.id()), agora(), motivo);
        return montar(gravar(tarefa), ator);
    }

    /** A tarefa já está gerenciada; o flush grava itens e histórico novos (cascade) e gera os ids da resposta. */
    private Tarefa gravar(Tarefa tarefa) {
        repository.flush();
        return tarefa;
    }

    // ---- regras de acesso e de estado

    private Tarefa paraAlterar(String id) {
        return repository.buscarParaAlterar(id).orElseThrow(TarefaService::naoEncontrada);
    }

    /** Só o responsável, com a tarefa em execução. */
    private Tarefa paraExecutar(String id, Ator ator) {
        var tarefa = paraAlterar(id);
        exigirAcesso(tarefa, ator);
        if (!responsavel(tarefa, ator)) throw new DomainException("Só o responsável pela tarefa pode executá-la.");
        if (tarefa.getStatus() != StatusTarefa.EM_EXECUCAO) {
            throw new DomainException(tarefa.getStatus() == StatusTarefa.EM_ANALISE
                    ? "A tarefa está em análise e não pode ser alterada."
                    : "A tarefa não está em execução.");
        }
        return tarefa;
    }

    private Tarefa paraAvaliar(String id, Ator ator, String acao) {
        var tarefa = paraAlterar(id);
        if (!ator.gestao()) throw new DomainException("Só Administrador ou Supervisor avalia tarefas.");
        if (tarefa.getStatus() != StatusTarefa.EM_ANALISE) throw new DomainException("Só tarefas em análise podem ser %s.", acao);
        return tarefa;
    }

    /** Funcionário só acessa tarefas das suas equipes; para os demais, a tarefa "não existe". */
    private static void exigirAcesso(Tarefa tarefa, Ator ator) {
        if (!ator.gestao() && !membro(tarefa, ator) && !responsavel(tarefa, ator)) throw TarefaService.naoEncontrada();
    }

    private static boolean membro(Tarefa tarefa, Ator ator) {
        return tarefa.equipeEfetiva().getMembros().stream().anyMatch(u -> u.getId().equals(ator.id()));
    }

    private static boolean responsavel(Tarefa tarefa, Ator ator) {
        return tarefa.getResponsavel() != null && tarefa.getResponsavel().getId().equals(ator.id());
    }

    // ---- respostas do checklist

    private static void aplicar(Tarefa tarefa, ExecucaoTarefaRequest request) {
        tarefa.setObservacao(texto(request.getObservacao()));
        var itens = tarefa.getItens().stream().collect(Collectors.toMap(TarefaItem::getId, Function.identity()));
        for (RespostaItemRequest resposta : Objects.requireNonNullElse(request.getRespostas(), List.<RespostaItemRequest>of())) {
            var item = itens.get(resposta.getItemId());
            if (item == null) throw new DomainException("Item do checklist não encontrado.");
            item.setResposta(normalizar(item, texto(resposta.getResposta())));
        }
    }

    private static String normalizar(TarefaItem item, String resposta) {
        if (resposta == null) return null;
        return switch (item.getTipoResposta()) {
            case SIM_NAO -> {
                if (!resposta.equals("SIM") && !resposta.equals("NAO")) throw new DomainException("Responda Sim ou Não: %s", item.getPergunta());
                yield resposta;
            }
            case NUMERO -> {
                BigDecimal numero;
                try {
                    numero = new BigDecimal(resposta.replace(',', '.'));
                } catch (NumberFormatException e) {
                    throw new DomainException("Informe um número: %s", item.getPergunta());
                }
                if (numero.abs().compareTo(MAX_NUMERO) > 0) throw new DomainException("Número fora do limite: %s", item.getPergunta());
                yield numero.stripTrailingZeros().toPlainString();
            }
            case TEXTO -> {
                int max = item.getMaxCaracteres() == null ? 500 : item.getMaxCaracteres();
                if (resposta.length() > max) throw new DomainException("No máximo %d caracteres: %s", max, item.getPergunta());
                yield resposta;
            }
        };
    }

    private static String texto(String valor) {
        if (valor == null) return null;
        var t = valor.trim();
        return t.isEmpty() ? null : t;
    }

    /** Só o nome final, sem caminho, com até 150 caracteres. */
    static String nomeSeguro(String nome) {
        var base = texto(nome);
        if (base == null) return "evidencia";
        base = base.substring(Math.max(base.lastIndexOf('/'), base.lastIndexOf('\\')) + 1).replaceAll("[\\p{Cntrl}\"]", "");
        if (base.isBlank()) return "evidencia";
        return base.length() > MAX_NOME_ARQUIVO ? base.substring(base.length() - MAX_NOME_ARQUIVO) : base;
    }

    // ---- resposta

    private TarefaDetalheResponse montar(Tarefa tarefa, Ator ator) {
        List<TarefaDetalheResponse.Item> itens = tarefa.getItens().isEmpty() && tarefa.checklistEfetivo() != null
                ? tarefa.checklistEfetivo().getItens().stream()
                    .sorted(Comparator.comparing(ChecklistItem::getOrdem))
                    .map(m -> new TarefaDetalheResponse.Item(m.getId(), m.getOrdem(), m.getPergunta(), m.getTipoResposta(),
                            m.getObrigatorio(), m.getMaxCaracteres(), null))
                    .toList()
                : tarefa.getItens().stream().map(TarefaDetalheResponse.Item::de).toList();
        var acoes = TarefaDetalheResponse.Acoes.builder()
                .assumir(tarefa.getStatus() == StatusTarefa.AGENDADA && membro(tarefa, ator))
                .executar(tarefa.getStatus() == StatusTarefa.EM_EXECUCAO && responsavel(tarefa, ator))
                .avaliar(tarefa.getStatus() == StatusTarefa.EM_ANALISE && ator.gestao())
                .build();
        return TarefaDetalheResponse.builder()
                .tarefa(TarefaResponse.de(tarefa, agora()))
                .observacao(tarefa.getObservacao())
                .itens(itens)
                .evidencias(evidenciaRepository.findByTarefaIdOrderByDataCriacaoAsc(tarefa.getId()).stream()
                        .map(TarefaDetalheResponse.Evidencia::de).toList())
                .historico(tarefa.getHistorico().stream().map(TarefaDetalheResponse.Historico::de).toList())
                .acoes(acoes)
                .build();
    }
}
