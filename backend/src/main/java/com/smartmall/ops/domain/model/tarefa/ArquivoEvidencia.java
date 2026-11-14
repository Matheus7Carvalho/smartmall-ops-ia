package com.smartmall.ops.domain.model.tarefa;

/** Conteúdo de uma evidência para download/exibição. */
public record ArquivoEvidencia(String nomeArquivo, String tipoConteudo, byte[] conteudo) {
}
