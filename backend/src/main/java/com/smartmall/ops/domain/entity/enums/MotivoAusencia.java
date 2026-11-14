package com.smartmall.ops.domain.entity.enums;

/**
 * Motivo genérico da ausência. LGPD: não há "atestado" nem texto livre, para não registrar
 * dado de saúde (sensível); afastamento cobre qualquer caso sem expor a causa.
 */
public enum MotivoAusencia {
    FOLGA,
    FERIAS,
    AFASTAMENTO,
    TREINAMENTO,
    OUTRO
}
