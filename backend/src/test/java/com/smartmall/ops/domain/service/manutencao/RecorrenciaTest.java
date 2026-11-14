package com.smartmall.ops.domain.service.manutencao;

import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class RecorrenciaTest {

    private static final LocalTime OITO = LocalTime.of(8, 0);

    private static ManutencaoProgramada programada(Frequencia frequencia, int intervalo, LocalDate inicio, LocalDate fim) {
        var programada = new ManutencaoProgramada();
        programada.setFrequencia(frequencia);
        programada.setIntervalo(intervalo);
        programada.setDataInicio(inicio);
        programada.setHorario(OITO);
        programada.setDataFim(fim);
        return programada;
    }

    private static LocalDateTime em(int ano, int mes, int dia) {
        return LocalDateTime.of(ano, mes, dia, 8, 0);
    }

    private static final LocalDateTime INICIO_2026 = LocalDateTime.of(2026, 1, 1, 0, 0);
    private static final LocalDateTime FIM_2026 = LocalDateTime.of(2026, 12, 31, 23, 59);

    @Test
    void unicaGeraUmaDataSo() {
        var datas = Recorrencia.datas(programada(Frequencia.UNICA, 1, LocalDate.of(2026, 3, 10), null), INICIO_2026, FIM_2026);

        assertThat(datas).containsExactly(em(2026, 3, 10));
    }

    @Test
    void diariaACada3Dias() {
        var p = programada(Frequencia.DIARIA, 3, LocalDate.of(2026, 3, 1), null);

        assertThat(Recorrencia.datas(p, INICIO_2026, em(2026, 3, 10)))
                .containsExactly(em(2026, 3, 1), em(2026, 3, 4), em(2026, 3, 7), em(2026, 3, 10));
    }

    @Test
    void semanalRepeteODiaDaSemana() {
        var p = programada(Frequencia.SEMANAL, 1, LocalDate.of(2026, 11, 16), null); // segunda-feira

        var datas = Recorrencia.datas(p, INICIO_2026, em(2026, 12, 7));

        assertThat(datas).containsExactly(em(2026, 11, 16), em(2026, 11, 23), em(2026, 11, 30), em(2026, 12, 7));
        assertThat(datas).allSatisfy(d -> assertThat(d.getDayOfWeek()).isEqualTo(java.time.DayOfWeek.MONDAY));
    }

    @Test
    void semanalACada2Semanas() {
        var p = programada(Frequencia.SEMANAL, 2, LocalDate.of(2026, 11, 16), null);

        assertThat(Recorrencia.datas(p, INICIO_2026, em(2026, 12, 14)))
                .containsExactly(em(2026, 11, 16), em(2026, 11, 30), em(2026, 12, 14));
    }

    @Test
    void mensalNoDia31UsaOUltimoDiaSemAcumularDesvio() {
        var p = programada(Frequencia.MENSAL, 1, LocalDate.of(2026, 1, 31), null);

        assertThat(Recorrencia.datas(p, INICIO_2026, em(2026, 5, 31)))
                .containsExactly(em(2026, 1, 31), em(2026, 2, 28), em(2026, 3, 31), em(2026, 4, 30), em(2026, 5, 31));
    }

    @Test
    void mensalACada3Meses() {
        var p = programada(Frequencia.MENSAL, 3, LocalDate.of(2026, 1, 15), null);

        assertThat(Recorrencia.datas(p, INICIO_2026, FIM_2026))
                .containsExactly(em(2026, 1, 15), em(2026, 4, 15), em(2026, 7, 15), em(2026, 10, 15));
    }

    @Test
    void dataDeTerminoIncluiOUltimoDia() {
        var p = programada(Frequencia.DIARIA, 1, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 3));

        assertThat(Recorrencia.datas(p, INICIO_2026, FIM_2026))
                .containsExactly(em(2026, 3, 1), em(2026, 3, 2), em(2026, 3, 3));
    }

    @Test
    void respeitaAJanelaPedida() {
        var p = programada(Frequencia.DIARIA, 1, LocalDate.of(2026, 3, 1), null);

        assertThat(Recorrencia.datas(p, LocalDateTime.of(2026, 3, 5, 8, 0), LocalDateTime.of(2026, 3, 6, 23, 0)))
                .containsExactly(em(2026, 3, 5), em(2026, 3, 6));
    }

    @Test
    void janelaComecaDepoisDoHorarioExcluiAqueleDia() {
        var p = programada(Frequencia.DIARIA, 1, LocalDate.of(2026, 3, 1), null);

        assertThat(Recorrencia.datas(p, LocalDateTime.of(2026, 3, 5, 9, 0), LocalDateTime.of(2026, 3, 6, 23, 0)))
                .containsExactly(em(2026, 3, 6));
    }

    @Test
    void janelaInvertidaNaoGeraNada() {
        var p = programada(Frequencia.DIARIA, 1, LocalDate.of(2026, 3, 1), null);

        assertThat(Recorrencia.datas(p, FIM_2026, INICIO_2026)).isEmpty();
    }

    @Test
    void inicioDepoisDaJanelaNaoGeraNada() {
        var p = programada(Frequencia.SEMANAL, 1, LocalDate.of(2027, 1, 4), null);

        assertThat(Recorrencia.datas(p, INICIO_2026, FIM_2026)).isEmpty();
    }
}
