package com.smartmall.ops.domain.repository.equipamento;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipamentoRepository extends BaseRepository<Equipamento> {

    /** Código já usado por outro equipamento. id nulo = cadastro novo. */
    @Query("select count(e) > 0 from Equipamento e where lower(e.codigo) = lower(:codigo) and (:id is null or e.id <> :id)")
    boolean existeCodigo(String codigo, String id);

    long countByCondicao(CondicaoEquipamento condicao);
}
