package com.smartmall.ops.domain.repository.tarefa;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaRepository extends BaseRepository<Tarefa> {

    /**
     * Consulta da agenda. Filtros nulos são ignorados.
     * membroId: restringe às equipes de que o usuário é membro (visão do Funcionário).
     */
    @Query("""
            select m from Tarefa m
            left join m.programada p
            left join p.equipe pe
            left join m.equipe te
            where m.dataHoraPrevista >= :de and m.dataHoraPrevista < :ate
              and (:programadaId is null or p.id = :programadaId)
              and (:equipeId is null or coalesce(te.id, pe.id) = :equipeId)
              and (:membroId is null or exists (
                    select 1 from Equipe membroEquipe join membroEquipe.membros u
                    where membroEquipe.id = coalesce(te.id, pe.id) and u.id = :membroId))
            order by m.dataHoraPrevista
            """)
    List<Tarefa> buscar(LocalDateTime de, LocalDateTime ate, String programadaId, String equipeId, String membroId);

    /** Bloqueia a linha até o fim da transação: dois membros não assumem a mesma tarefa ao mesmo tempo. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Tarefa t where t.id = :id")
    Optional<Tarefa> buscarParaAlterar(String id);

    Optional<Tarefa> findFirstByPlanoAcaoId(String planoAcaoId);

    /** Fila de análise: o envio mais antigo primeiro. */
    List<Tarefa> findByStatusOrderByUltimoEnvioAsc(StatusTarefa status);

    List<Tarefa> findByProgramadaIdAndDataHoraPrevistaGreaterThanEqual(String programadaId, LocalDateTime aPartirDe);

    List<Tarefa> findByProgramadaIdAndDataHoraPrevistaBetween(String programadaId, LocalDateTime de, LocalDateTime ate);

    long countByStatus(StatusTarefa status);

    /** Tarefas previstas em [de, ate) reprovadas ao menos uma vez na análise. equipeId nulo = todas. */
    @Query("""
            select distinct h.tarefa.id from TarefaHistorico h
            where h.acao = 'REPROVADA'
              and h.tarefa.dataHoraPrevista >= :de and h.tarefa.dataHoraPrevista < :ate
              and (:equipeId is null or h.tarefa.programada.equipe.id = :equipeId)
            """)
    List<String> idsComReprovacao(LocalDateTime de, LocalDateTime ate, String equipeId);

    /** Tarefas assumidas no status informado, da mais antiga para a mais recente. */
    List<Tarefa> findByStatusAndResponsavelIsNotNullOrderByDataHoraPrevistaAsc(StatusTarefa status);

    /** Agendadas com data e hora em [de, agora): a mesma regra de Tarefa.isAtrasada. */
    @Query("select count(t) from Tarefa t where t.status = 'AGENDADA' and t.dataHoraPrevista >= :de and t.dataHoraPrevista < :agora")
    long contarAtrasadas(LocalDateTime de, LocalDateTime agora);

    /** Equipes distintas com ao menos uma tarefa no status informado. */
    @Query("select count(distinct t.programada.equipe.id) from Tarefa t where t.status = :status")
    long contarEquipesComStatus(StatusTarefa status);

    boolean existsByProgramadaIdAndStatusNotIn(String programadaId, Collection<StatusTarefa> status);

    @Modifying
    @Query("delete from Tarefa m where m.programada.id = :programadaId")
    void excluirDaProgramada(String programadaId);

    /** Próxima tarefa agendada de cada manutenção programada informada: [id, dataHora]. */
    @Query("""
            select m.programada.id, min(m.dataHoraPrevista) from Tarefa m
            where m.programada.id in :programadaIds and m.status = 'AGENDADA' and m.dataHoraPrevista >= :agora
            group by m.programada.id
            """)
    List<Object[]> proximas(Collection<String> programadaIds, LocalDateTime agora);
}
