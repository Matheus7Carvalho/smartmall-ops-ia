package com.smartmall.ops.domain.service.estoque;

import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import com.smartmall.ops.domain.model.estoque.FiltroMovimentacoes;
import com.smartmall.ops.domain.model.estoque.MovimentacaoRequest;
import com.smartmall.ops.domain.model.estoque.MovimentacaoResponse;

import java.util.List;

public interface IMovimentacaoEstoqueService {

    /** Registra a entrada ou a retirada e atualiza o saldo do item na mesma transação. */
    MovimentacaoResponse movimentar(String itemId, TipoMovimentacao tipo, MovimentacaoRequest request, String usuarioId);

    /** Rastreabilidade do item, da mais recente para a mais antiga. */
    List<MovimentacaoResponse> doItem(String itemId);

    /** Histórico geral do período (máximo de um ano). */
    List<MovimentacaoResponse> buscar(FiltroMovimentacoes filtro);

    /** Equipamentos que podem ser destino de uma retirada: só id, código e nome, em ordem de código. */
    List<MovimentacaoResponse.Resumo> destinos();
}
