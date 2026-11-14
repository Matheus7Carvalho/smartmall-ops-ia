package com.smartmall.ops.api.config.tempo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.util.TimeZone;

/** Relógio injetável: regras com "agora" (atrasada, horizonte) são testáveis com Clock.fixed. */
@Configuration
public class TempoConfiguration {

    @Bean
    public Clock clock() {
        return Clock.system(TimeZone.getDefault().toZoneId());
    }
}
