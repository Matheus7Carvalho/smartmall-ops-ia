package com.smartmall.ops.domain.service.manutencao;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.repository.checklist.ChecklistRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** Regras em docs/modulo-manutencao.md, seção "Manutenção programada (recorrência)". */
@Service
public class ManutencaoProgramadaService extends BaseService<ManutencaoProgramada> implements IManutencaoProgramadaService {

    public static final int HORIZONTE_DIAS = 120;
    private static final Set<StatusTarefa> NAO_EXECUTADAS = Set.of(StatusTarefa.AGENDADA, StatusTarefa.CANCELADA);

    private final EquipamentoRepository equipamentoRepository;
    private final ChecklistRepository checklistRepository;
    private final EquipeRepository equipeRepository;
    private final TarefaRepository tarefaRepository;
    private final UsuarioRepository usuarioRepository;
    private final Clock clock;

    protected ManutencaoProgramadaService(final ManutencaoProgramadaRepository repository,
                                     final EquipamentoRepository equipamentoRepository,
                                     final ChecklistRepository checklistRepository,
                                     final EquipeRepository equipeRepository,
                                     final TarefaRepository tarefaRepository,
                                     final UsuarioRepository usuarioRepository,
                                     final Clock clock) {
        super(repository);
        this.equipamentoRepository = equipamentoRepository;
        this.checklistRepository = checklistRepository;
        this.equipeRepository = equipeRepository;
        this.tarefaRepository = tarefaRepository;
        this.usuarioRepository = usuarioRepository;
        this.clock = clock;
    }

    private LocalDateTime agora() {
        return LocalDateTime.now(clock);
    }

    private LocalDateTime horizonte() {
        return LocalDate.now(clock).plusDays(HORIZONTE_DIAS).atTime(23, 59, 59);
    }

    @Override
    @Transactional
    public ManutencaoProgramada create(ManutencaoProgramada programada) throws DomainException {
        preparar(programada);
        exigirInicioFuturo(programada);
        programada.setAtivo(Boolean.TRUE);
        var salvo = super.create(programada);
        gerar(salvo, agora(), horizonte());
        return salvo;
    }

    /** Altera a regra e refaz só as datas futuras. Datas passadas nunca mudam. */
    @Override
    @Transactional
    public ManutencaoProgramada update(ManutencaoProgramada alterado, String id) throws DomainException {
        var programada = getRepository().findById(id).orElseThrow(() -> new EntityNotFoundException("Item não encontrado."));
        if (!Boolean.TRUE.equals(programada.getAtivo())) {
            throw new DomainException("Manutenção programada encerrada não pode ser editada.");
        }
        preparar(alterado);
        // Mudar a data de início exige que ela seja futura; manter a data (mesmo passada) é permitido.
        if (!alterado.getDataInicio().equals(programada.getDataInicio())) exigirInicioFuturo(alterado);
        programada.setEquipamento(alterado.getEquipamento());
        programada.setChecklist(alterado.getChecklist());
        programada.setEquipe(alterado.getEquipe());
        programada.setFrequencia(alterado.getFrequencia());
        programada.setIntervalo(alterado.getIntervalo());
        programada.setDataInicio(alterado.getDataInicio());
        programada.setHorario(alterado.getHorario());
        programada.setDuracaoMinutos(alterado.getDuracaoMinutos());
        programada.setDataFim(alterado.getDataFim());
        programada.setObservacoes(alterado.getObservacoes());
        validate(programada);

        var salvo = getRepository().save(programada);
        refazerFuturas(salvo);
        return salvo;
    }

    /** Início (data + horário) precisa estar no futuro, senão a primeira tarefa nasceria atrasada. */
    private void exigirInicioFuturo(ManutencaoProgramada programada) {
        if (!programada.getDataInicio().atTime(programada.getHorario()).isAfter(agora())) {
            throw new DomainException("O início (data e horário) precisa ser no futuro.");
        }
    }

    @Override
    public void validate(ManutencaoProgramada programada) throws DomainException {
        if (programada.getDataFim() != null && programada.getDataFim().isBefore(programada.getDataInicio())) {
            throw new DomainException("A data de término não pode ser antes do início.");
        }
    }

    @Override
    @Transactional
    public ManutencaoProgramada encerrar(String id, String usuarioId) {
        var programada = findById(id);
        if (!Boolean.TRUE.equals(programada.getAtivo())) return programada;
        programada.setAtivo(Boolean.FALSE);
        var agora = agora();
        var usuario = usuarioRepository.getReferenceById(usuarioId);
        for (Tarefa m : tarefaRepository.findByProgramadaIdAndDataHoraPrevistaGreaterThanEqual(id, agora)) {
            if (m.getStatus() == StatusTarefa.AGENDADA) {
                m.mudarStatus(StatusTarefa.CANCELADA, AcaoTarefa.CANCELADA, usuario, agora, "Manutenção programada encerrada.");
            }
        }
        return getRepository().save(programada);
    }

    @Override
    @Transactional
    public void delete(String id) {
        findById(id);
        if (tarefaRepository.existsByProgramadaIdAndStatusNotIn(id, NAO_EXECUTADAS)) {
            throw new DomainException("Manutenção programada com tarefa executada não pode ser excluída. Encerre-a.");
        }
        tarefaRepository.excluirDaProgramada(id);
        super.delete(id);
    }

    @Override
    @Transactional
    public int estenderHorizonte() {
        int criadas = 0;
        var ate = horizonte();
        for (ManutencaoProgramada programada : getRepository().findByAtivoTrue()) {
            var de = programada.getGeradoAte() == null ? programada.getDataInicio().atStartOfDay() : programada.getGeradoAte().plusSeconds(1);
            criadas += gerar(programada, de, ate);
        }
        return criadas;
    }

    @Override
    public Map<String, LocalDateTime> proximasDatas(Collection<ManutencaoProgramada> programadas) {
        if (programadas.isEmpty()) return Map.of();
        var ids = programadas.stream().map(ManutencaoProgramada::getId).toList();
        var resultado = new HashMap<String, LocalDateTime>();
        for (Object[] linha : tarefaRepository.proximas(ids, agora())) {
            resultado.put((String) linha[0], (LocalDateTime) linha[1]);
        }
        return resultado;
    }

    /** Cria as tarefas da manutenção programada em [de, ate] que ainda não existem. */
    private int gerar(ManutencaoProgramada programada, LocalDateTime de, LocalDateTime ate) {
        int criadas = 0;
        if (!de.isAfter(ate)) {
            Set<LocalDateTime> existentes = tarefaRepository.findByProgramadaIdAndDataHoraPrevistaBetween(programada.getId(), de, ate)
                    .stream().map(Tarefa::getDataHoraPrevista).collect(Collectors.toSet());
            for (LocalDateTime dataHora : Recorrencia.datas(programada, de, ate)) {
                if (existentes.add(dataHora)) {
                    tarefaRepository.save(new Tarefa(programada, dataHora));
                    criadas++;
                }
            }
        }
        programada.setGeradoAte(ate);
        getRepository().save(programada);
        return criadas;
    }

    /**
     * Datas futuras: mantém as que continuam na sequência (inclusive canceladas),
     * remove as que saíram e cria as que faltam.
     */
    private void refazerFuturas(ManutencaoProgramada programada) {
        var agora = agora();
        var ate = horizonte();
        Set<LocalDateTime> novas = new HashSet<>(Recorrencia.datas(programada, agora, ate));
        List<Tarefa> futuras = tarefaRepository.findByProgramadaIdAndDataHoraPrevistaGreaterThanEqual(programada.getId(), agora);
        for (Tarefa m : futuras) {
            if (!novas.remove(m.getDataHoraPrevista()) && NAO_EXECUTADAS.contains(m.getStatus())) {
                tarefaRepository.delete(m);
            }
        }
        tarefaRepository.flush();
        novas.stream().sorted().forEach(dataHora -> tarefaRepository.save(new Tarefa(programada, dataHora)));
        programada.setGeradoAte(ate);
        getRepository().save(programada);
    }

    /** Normaliza e troca as referências (ids) pelas entidades reais. */
    private void preparar(ManutencaoProgramada programada) {
        if (programada.getFrequencia() == Frequencia.UNICA) {
            programada.setIntervalo(1);
            programada.setDataFim(null);
        }
        if (programada.getObservacoes() != null) {
            var texto = programada.getObservacoes().trim();
            programada.setObservacoes(texto.isEmpty() ? null : texto);
        }
        programada.setEquipamento(equipamentoRepository.findById(idDe(programada.getEquipamento()))
                .orElseThrow(() -> new DomainException("Equipamento não encontrado.")));
        programada.setChecklist(checklistRepository.findById(idDe(programada.getChecklist()))
                .orElseThrow(() -> new DomainException("Modelo de checklist não encontrado.")));
        programada.setEquipe(equipeRepository.findById(idDe(programada.getEquipe()))
                .orElseThrow(() -> new DomainException("Equipe não encontrada.")));
    }

    private static String idDe(com.smartmall.ops.domain.core.entity.BaseEntity referencia) {
        return referencia == null || referencia.getId() == null ? "" : referencia.getId();
    }

    @Override
    public ManutencaoProgramadaRepository getRepository() {
        return (ManutencaoProgramadaRepository) super.getRepository();
    }
}
