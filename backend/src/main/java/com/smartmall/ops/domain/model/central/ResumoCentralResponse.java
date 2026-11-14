package com.smartmall.ops.domain.model.central;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Visão geral da operação para o gestor (Central de Controle). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumoCentralResponse {

    private Tarefas tarefas;
    private Equipes equipes;
    private Equipamentos equipamentos;
    private Alertas alertas;

    /** Ativas = em execução + em análise. */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Tarefas {
        private long ativas;
        private long emExecucao;
        private long emAnalise;
    }

    /** Em operação = equipes com ao menos uma tarefa em execução. */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Equipes {
        private long emOperacao;
        private long total;
    }

    /** percentualOperando: inteiro de 0 a 100; 0 sem equipamentos. */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Equipamentos {
        private long total;
        private long operando;
        private int percentualOperando;
    }

    /** Urgentes = equipamentos inoperantes. Demais: equipamentos em atenção e tarefas atrasadas. */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Alertas {
        private long total;
        private long urgentes;
        private long equipamentosInoperantes;
        private long equipamentosEmAtencao;
        private long tarefasAtrasadas;
    }
}
