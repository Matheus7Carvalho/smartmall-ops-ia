package com.smartmall.ops.domain.repository.chamado;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Chamado;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

public interface ChamadoRepository extends BaseRepository<Chamado> {
    Optional<Chamado> findByChaveEnvio(String chaveEnvio);
    Page<Chamado> findByStatus(StatusChamado status, Pageable pageable);
    @Query(value = "select 1 from pg_advisory_xact_lock(hashtext(:chave))", nativeQuery = true)
    Integer bloquearChave(String chave);
}
