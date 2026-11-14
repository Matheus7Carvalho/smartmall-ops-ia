package com.smartmall.ops.domain.service.manutencao;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Mantém as tarefas geradas até o horizonte: na inicialização e todo dia às 03:00. */
@Slf4j
@Component
public class HorizonteAgendador {

    private final IManutencaoProgramadaService programadaService;

    public HorizonteAgendador(IManutencaoProgramadaService programadaService) {
        this.programadaService = programadaService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void aoIniciar() {
        estender();
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void diariamente() {
        estender();
    }

    private void estender() {
        int criadas = programadaService.estenderHorizonte();
        log.info("Horizonte de tarefas estendido: {} criada(s).", criadas);
    }
}
