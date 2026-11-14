package com.smartmall.ops.domain.core.mapper;

import com.smartmall.ops.domain.core.entity.BaseEntity;

import java.util.function.Supplier;

/**
 * Converte o id recebido no Request em uma entidade "referência" (só com id).
 * O serviço substitui a referência pela entidade real e valida se ela existe.
 */
public final class Referencias {

    private Referencias() {
    }

    public static <T extends BaseEntity> T porId(String id, Supplier<T> fabrica) {
        if (id == null || id.isBlank()) return null;
        T referencia = fabrica.get();
        referencia.setId(id);
        return referencia;
    }
}
