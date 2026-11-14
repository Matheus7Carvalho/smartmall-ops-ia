package com.smartmall.ops.domain.repository.ausencia;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Ausencia;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AusenciaRepository extends BaseRepository<Ausencia> {

    /** Ausências que terminam a partir do dia informado (vigentes e futuras), da mais próxima para a mais distante. */
    List<Ausencia> findByFimGreaterThanEqualOrderByInicioAsc(LocalDate dia);

    /** Já existe ausência do funcionário que cruza o período [inicio, fim]. */
    @Query("select count(a) > 0 from Ausencia a where a.usuario.id = :usuarioId and a.inicio <= :fim and a.fim >= :inicio")
    boolean existeNoPeriodo(String usuarioId, LocalDate inicio, LocalDate fim);
}
