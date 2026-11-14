package com.smartmall.ops.domain.service.tarefa;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;

/** Formatos aceitos como evidência, identificados pelo conteúdo (assinatura), não pelo nome nem pelo tipo declarado. */
enum TipoImagem {
    JPEG("image/jpeg"),
    PNG("image/png"),
    WEBP("image/webp");

    private static final byte[] PNG_ASSINATURA = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'};

    final String tipoConteudo;

    TipoImagem(String tipoConteudo) {
        this.tipoConteudo = tipoConteudo;
    }

    static Optional<TipoImagem> detectar(byte[] b) {
        if (b == null) return Optional.empty();
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return Optional.of(JPEG);
        if (b.length >= 8 && Arrays.equals(Arrays.copyOf(b, 8), PNG_ASSINATURA)) return Optional.of(PNG);
        if (b.length >= 12 && "RIFF".equals(ascii(b, 0)) && "WEBP".equals(ascii(b, 8))) return Optional.of(WEBP);
        return Optional.empty();
    }

    private static String ascii(byte[] b, int inicio) {
        return new String(b, inicio, 4, StandardCharsets.US_ASCII);
    }
}
