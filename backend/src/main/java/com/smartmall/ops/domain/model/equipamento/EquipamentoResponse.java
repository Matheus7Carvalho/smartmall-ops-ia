package com.smartmall.ops.domain.model.equipamento;

import com.smartmall.ops.domain.entity.enums.CategoriaEquipamento;
import com.smartmall.ops.domain.entity.enums.CondicaoEquipamento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipamentoResponse {
    private String id;
    private String codigo;
    private String nome;
    private CategoriaEquipamento categoria;
    private String pisoId;
    private String pisoNome;
    private String localizacao;
    private CondicaoEquipamento condicao;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}
