package com.smartmall.ops.domain.service.disponibilidade;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Ausencia;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.model.disponibilidade.AusenciaRequest;
import com.smartmall.ops.domain.model.disponibilidade.AusenciaResponse;
import com.smartmall.ops.domain.model.disponibilidade.FuncionarioDisponibilidadeResponse;
import com.smartmall.ops.domain.model.disponibilidade.FuncionarioDisponibilidadeResponse.Resumo;
import com.smartmall.ops.domain.model.disponibilidade.FuncionarioDisponibilidadeResponse.TarefaAtual;
import com.smartmall.ops.domain.model.disponibilidade.SituacaoFuncionario;
import com.smartmall.ops.domain.repository.ausencia.AusenciaRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DisponibilidadeService implements IDisponibilidadeService {

    /** Período máximo de uma ausência, em dias (um ano, contando ano bissexto). */
    static final int DIAS_MAXIMOS = 366;

    private final UsuarioRepository usuarioRepository;
    private final EquipeRepository equipeRepository;
    private final TarefaRepository tarefaRepository;
    private final AusenciaRepository ausenciaRepository;
    private final Clock clock;

    public DisponibilidadeService(UsuarioRepository usuarioRepository, EquipeRepository equipeRepository,
                                  TarefaRepository tarefaRepository, AusenciaRepository ausenciaRepository, Clock clock) {
        this.usuarioRepository = usuarioRepository;
        this.equipeRepository = equipeRepository;
        this.tarefaRepository = tarefaRepository;
        this.ausenciaRepository = ausenciaRepository;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FuncionarioDisponibilidadeResponse> hoje() {
        var hoje = LocalDate.now(clock);

        Map<String, List<Resumo>> equipesPorMembro = new HashMap<>();
        for (Equipe e : equipeRepository.findAll()) {
            for (Usuario m : e.getMembros()) {
                equipesPorMembro.computeIfAbsent(m.getId(), k -> new ArrayList<>()).add(new Resumo(e.getId(), e.getNome()));
            }
        }
        equipesPorMembro.values().forEach(l -> l.sort(Comparator.comparing(Resumo::nome)));

        Map<String, List<Tarefa>> emExecucao = new HashMap<>();
        for (Tarefa t : tarefaRepository.findByStatusAndResponsavelIsNotNullOrderByDataHoraPrevistaAsc(StatusTarefa.EM_EXECUCAO)) {
            emExecucao.computeIfAbsent(t.getResponsavel().getId(), k -> new ArrayList<>()).add(t);
        }

        // Ordenadas da mais próxima para a mais distante: a primeira de cada um é a vigente ou a próxima.
        Map<String, Ausencia> ausencias = new HashMap<>();
        for (Ausencia a : ausenciaRepository.findByFimGreaterThanEqualOrderByInicioAsc(hoje)) {
            ausencias.putIfAbsent(a.getUsuario().getId(), a);
        }

        return usuarioRepository.findByPerfilAndAtivoTrueOrderByNome(Perfil.FUNCIONARIO).stream()
                .map(u -> {
                    var tarefas = emExecucao.getOrDefault(u.getId(), List.of());
                    var ausencia = ausencias.get(u.getId());
                    SituacaoFuncionario situacao;
                    if (ausencia != null && ausencia.vigenteEm(hoje)) situacao = SituacaoFuncionario.INDISPONIVEL;
                    else if (!tarefas.isEmpty()) situacao = SituacaoFuncionario.OCUPADO;
                    else situacao = SituacaoFuncionario.DISPONIVEL;
                    return new FuncionarioDisponibilidadeResponse(
                            u.getId(), u.getNome(),
                            equipesPorMembro.getOrDefault(u.getId(), List.of()),
                            situacao,
                            tarefas.isEmpty() ? null : tarefaAtual(tarefas.getFirst()),
                            tarefas.size(),
                            ausencia == null ? null : AusenciaResponse.de(ausencia));
                })
                .toList();
    }

    private static TarefaAtual tarefaAtual(Tarefa t) {
        var equipamento = t.getProgramada().getEquipamento();
        return new TarefaAtual(t.getId(), equipamento.getCodigo() + " · " + equipamento.getNome(),
                t.getProgramada().getEquipe().getNome(), t.getDataHoraPrevista());
    }

    @Override
    @Transactional
    public AusenciaResponse registrarAusencia(AusenciaRequest request, String gestorId) {
        var hoje = LocalDate.now(clock);
        var funcionario = usuarioRepository.findById(request.getUsuarioId())
                .filter(u -> u.getPerfil() == Perfil.FUNCIONARIO && Boolean.TRUE.equals(u.getAtivo()))
                .orElseThrow(() -> new DomainException("Funcionário não encontrado."));
        if (request.getFim().isBefore(request.getInicio())) {
            throw new DomainException("A data final deve ser igual ou posterior à inicial.");
        }
        if (request.getFim().isBefore(hoje)) {
            throw new DomainException("Informe um período a partir de hoje.");
        }
        if (ChronoUnit.DAYS.between(request.getInicio(), request.getFim()) >= DIAS_MAXIMOS) {
            throw new DomainException("O período máximo é de um ano.");
        }
        if (ausenciaRepository.existeNoPeriodo(funcionario.getId(), request.getInicio(), request.getFim())) {
            throw new DomainException("Já existe ausência registrada nesse período.");
        }
        var ausencia = new Ausencia();
        ausencia.setUsuario(funcionario);
        ausencia.setInicio(request.getInicio());
        ausencia.setFim(request.getFim());
        ausencia.setMotivo(request.getMotivo());
        ausencia.setRegistradaPor(usuarioRepository.getReferenceById(gestorId));
        return AusenciaResponse.de(ausenciaRepository.save(ausencia));
    }

    @Override
    @Transactional
    public void encerrarAusencia(String id) {
        var hoje = LocalDate.now(clock);
        var ausencia = ausenciaRepository.findById(id).orElseThrow(() -> new DomainException("Ausência não encontrada."));
        if (ausencia.getFim().isBefore(hoje)) {
            throw new DomainException("Esta ausência já terminou.");
        }
        if (!ausencia.getInicio().isBefore(hoje)) {
            ausenciaRepository.delete(ausencia);
            return;
        }
        ausencia.setFim(hoje.minusDays(1));
        ausenciaRepository.save(ausencia);
    }
}
