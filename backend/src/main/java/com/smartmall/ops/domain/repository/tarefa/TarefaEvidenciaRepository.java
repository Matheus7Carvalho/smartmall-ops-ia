package com.smartmall.ops.domain.repository.tarefa;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.TarefaEvidencia;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaEvidenciaRepository extends BaseRepository<TarefaEvidencia> {

    List<TarefaEvidencia> findByTarefaIdOrderByDataCriacaoAsc(String tarefaId);

    Optional<TarefaEvidencia> findByIdAndTarefaId(String id, String tarefaId);

    long countByTarefaId(String tarefaId);

    long countByTarefaIdAndEnvioIsNull(String tarefaId);

    @Query("select e.arquivo.id from TarefaEvidencia e where e.tarefa.programada.id = :programadaId")
    List<String> arquivosDaProgramada(String programadaId);
}
