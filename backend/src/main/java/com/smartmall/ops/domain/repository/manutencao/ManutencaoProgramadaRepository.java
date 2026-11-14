package com.smartmall.ops.domain.repository.manutencao;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManutencaoProgramadaRepository extends BaseRepository<ManutencaoProgramada> {

    boolean existsByEquipamentoId(String equipamentoId);

    boolean existsByEquipeId(String equipeId);

    boolean existsByChecklistId(String checklistId);

    List<ManutencaoProgramada> findByAtivoTrue();

    /** Limpeza de dados de teste E2E (marca nas observações). */
    List<ManutencaoProgramada> findByObservacoes(String observacoes);
}
