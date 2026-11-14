package com.smartmall.ops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class SmartMallOpsApplication {

    /** Fuso do shopping. LocalDateTime em toda a aplicação segue este fuso, inclusive em container (que vem em UTC). */
    public static final String FUSO_PADRAO = "America/Araguaina";

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone(System.getenv().getOrDefault("APP_FUSO_HORARIO", FUSO_PADRAO)));
        SpringApplication.run(SmartMallOpsApplication.class, args);
    }
}