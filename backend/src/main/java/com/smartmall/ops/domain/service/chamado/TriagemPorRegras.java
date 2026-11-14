package com.smartmall.ops.domain.service.chamado;

import com.smartmall.ops.domain.entity.enums.PrioridadeChamado;
import com.smartmall.ops.domain.entity.enums.TipoChamado;
import java.text.Normalizer;
import java.util.Locale;
import org.springframework.stereotype.Component;

/** Sugestões transparentes, sem decisão automática sobre execução. */
@Component
public class TriagemPorRegras {
    public Sugestao sugerir(String descricao) {
        String texto = Normalizer.normalize(descricao, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        TipoChamado tipo = TipoChamado.OUTRO;
        if (texto.matches("(?s).*(quebrad|vazament|entupid|sem luz|nao funciona|manutenc|defeito|infiltr).*"))
            tipo = TipoChamado.MANUTENCAO;
        else if (texto.matches("(?s).*(reclam|demora|atendimento ruim|sujeira|insatisfeit).*"))
            tipo = TipoChamado.RECLAMACAO;
        else if (texto.matches("(?s).*(pesquisa|sugest|avaliac|opinao|questionario).*"))
            tipo = TipoChamado.PESQUISA;
        PrioridadeChamado prioridade = PrioridadeChamado.MEDIA;
        if (texto.matches("(?s).*(incendio|fogo|choque eletrico|ferid|acidente|emergenc).*"))
            prioridade = PrioridadeChamado.CRITICA;
        else if (texto.matches("(?s).*(vazament|inund|sem luz|perigo|risco|entupid).*"))
            prioridade = PrioridadeChamado.ALTA;
        else if (tipo == TipoChamado.PESQUISA) prioridade = PrioridadeChamado.BAIXA;
        return new Sugestao(tipo, prioridade);
    }

    public record Sugestao(TipoChamado tipo, PrioridadeChamado prioridade) { }
}
