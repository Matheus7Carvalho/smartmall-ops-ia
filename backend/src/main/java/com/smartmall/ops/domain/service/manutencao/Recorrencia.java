package com.smartmall.ops.domain.service.manutencao;

import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.enums.Frequencia;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Calcula as datas de uma manutenção programada. Sem estado e sem banco: testável isoladamente.
 * Cada data é início + k × intervalo (não soma sobre a anterior), para não acumular deslocamento:
 * mensal a partir de 31/01 dá 28/02, 31/03, 30/04…
 */
public final class Recorrencia {

    /** Proteção contra laço longo (ex.: diária por anos). */
    private static final int MAX_DATAS = 2_000;

    private Recorrencia() {
    }

    /** Datas da manutenção programada no intervalo [de, ate], inclusive. */
    public static List<LocalDateTime> datas(ManutencaoProgramada programada, LocalDateTime de, LocalDateTime ate) {
        var datas = new ArrayList<LocalDateTime>();
        if (de.isAfter(ate)) return datas;

        for (int k = 0; k < MAX_DATAS; k++) {
            LocalDate dia = dia(programada, k);
            if (dia == null) break;
            if (programada.getDataFim() != null && dia.isAfter(programada.getDataFim())) break;
            LocalDateTime dataHora = dia.atTime(programada.getHorario());
            if (dataHora.isAfter(ate)) break;
            if (!dataHora.isBefore(de)) datas.add(dataHora);
        }
        return datas;
    }

    /** k-ésima data da sequência; null quando a sequência acabou (frequência única). */
    private static LocalDate dia(ManutencaoProgramada programada, int k) {
        LocalDate inicio = programada.getDataInicio();
        long passo = (long) k * programada.getIntervalo();
        return switch (programada.getFrequencia()) {
            case UNICA -> k == 0 ? inicio : null;
            case DIARIA -> inicio.plusDays(passo);
            case SEMANAL -> inicio.plusWeeks(passo);
            case MENSAL -> inicio.plusMonths(passo);
        };
    }

    public static boolean recorrente(Frequencia frequencia) {
        return frequencia != Frequencia.UNICA;
    }
}
