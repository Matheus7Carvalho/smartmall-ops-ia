package com.smartmall.ops.domain.model.estoque;

import com.smartmall.ops.domain.entity.MovimentacaoEstoque;
import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import com.smartmall.ops.domain.entity.enums.UnidadeMedida;

import java.time.LocalDateTime;

/** Uma linha da rastreabilidade. Do usuário, só o nome (LGPD: sem e-mail). */
public record MovimentacaoResponse(
        String id,
        Resumo item,
        UnidadeMedida unidade,
        TipoMovimentacao tipo,
        int quantidade,
        int saldoApos,
        LocalDateTime dataHora,
        String usuario,
        Resumo equipamento,
        String observacao) {

    public record Resumo(String id, String codigo, String nome) {
    }

    public static MovimentacaoResponse de(MovimentacaoEstoque m) {
        var i = m.getItem();
        var e = m.getEquipamento();
        return new MovimentacaoResponse(m.getId(), new Resumo(i.getId(), i.getCodigo(), i.getNome()), i.getUnidade(), m.getTipo(),
                m.getQuantidade(), m.getSaldoApos(), m.getDataHora(), m.getUsuario().getNome(),
                e == null ? null : new Resumo(e.getId(), e.getCodigo(), e.getNome()), m.getObservacao());
    }
}
