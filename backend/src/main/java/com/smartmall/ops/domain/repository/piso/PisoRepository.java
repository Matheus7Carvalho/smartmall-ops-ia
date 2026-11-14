package com.smartmall.ops.domain.repository.piso;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Piso;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PisoRepository extends BaseRepository<Piso> {

    /** Código já usado por outro piso. id nulo = cadastro novo. */
    @Query("select count(p) > 0 from Piso p where lower(p.codigo) = lower(:codigo) and (:id is null or p.id <> :id)")
    boolean existeCodigo(String codigo, String id);
}
