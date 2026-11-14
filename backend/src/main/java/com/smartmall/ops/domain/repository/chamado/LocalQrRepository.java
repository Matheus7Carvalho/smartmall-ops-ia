package com.smartmall.ops.domain.repository.chamado;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.LocalQr;
import java.util.Optional;

public interface LocalQrRepository extends BaseRepository<LocalQr> {
    Optional<LocalQr> findByCodigoAndAtivoTrue(String codigo);
}
