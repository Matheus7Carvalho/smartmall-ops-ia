package com.smartmall.ops.domain.repository.chamado;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.ChamadoHistorico;
import java.util.List;

public interface ChamadoHistoricoRepository extends BaseRepository<ChamadoHistorico> {
    List<ChamadoHistorico> findByChamadoIdOrderByDataHoraAsc(String chamadoId);
}
