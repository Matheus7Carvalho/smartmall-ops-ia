package com.smartmall.ops.domain.service.chamado;

import com.smartmall.ops.domain.entity.enums.PrioridadeChamado;
import com.smartmall.ops.domain.entity.enums.TipoChamado;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class TriagemPorRegrasTest {
    private final TriagemPorRegras regras = new TriagemPorRegras();

    @Test void sugereManutencaoCriticaSemAprovar() {
        var sugestao = regras.sugerir("Incêndio no equipamento quebrado");
        assertThat(sugestao.tipo()).isEqualTo(TipoChamado.MANUTENCAO);
        assertThat(sugestao.prioridade()).isEqualTo(PrioridadeChamado.CRITICA);
    }

    @Test void pesquisaRecebePrioridadeBaixa() {
        var sugestao = regras.sugerir("Sugestão para pesquisa de satisfação");
        assertThat(sugestao.tipo()).isEqualTo(TipoChamado.PESQUISA);
        assertThat(sugestao.prioridade()).isEqualTo(PrioridadeChamado.BAIXA);
    }
}
