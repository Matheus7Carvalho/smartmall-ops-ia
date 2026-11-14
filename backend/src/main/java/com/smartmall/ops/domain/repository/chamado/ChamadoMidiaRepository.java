package com.smartmall.ops.domain.repository.chamado;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.ChamadoMidia;
import java.util.Optional;

public interface ChamadoMidiaRepository extends BaseRepository<ChamadoMidia> {
    Optional<ChamadoMidia> findByChamadoId(String chamadoId);
}
