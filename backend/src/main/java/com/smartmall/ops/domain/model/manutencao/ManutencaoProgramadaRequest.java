package com.smartmall.ops.domain.model.manutencao;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.smartmall.ops.domain.entity.enums.Frequencia;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManutencaoProgramadaRequest {

    @NotBlank(message = "Selecione o equipamento.")
    @Size(max = 36, message = "Equipamento inválido.")
    private String equipamentoId;

    @NotBlank(message = "Selecione o modelo de checklist.")
    @Size(max = 36, message = "Modelo de checklist inválido.")
    private String checklistId;

    @NotBlank(message = "Selecione a equipe.")
    @Size(max = 36, message = "Equipe inválida.")
    private String equipeId;

    @NotNull(message = "Selecione a frequência.")
    private Frequencia frequencia;

    @NotNull(message = "Informe o intervalo.")
    @Min(value = 1, message = "O intervalo deve ser entre 1 e 12.")
    @Max(value = 12, message = "O intervalo deve ser entre 1 e 12.")
    @Builder.Default
    private Integer intervalo = 1;

    @NotNull(message = "Informe a data de início.")
    private LocalDate dataInicio;

    @NotNull(message = "Informe o horário.")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horario;

    @NotNull(message = "Informe a duração.")
    @Min(value = 15, message = "A duração deve ser entre 15 e 720 minutos.")
    @Max(value = 720, message = "A duração deve ser entre 15 e 720 minutos.")
    private Integer duracaoMinutos;

    private LocalDate dataFim;

    @Size(max = 500, message = "As observações devem ter até 500 caracteres.")
    private String observacoes;
}
