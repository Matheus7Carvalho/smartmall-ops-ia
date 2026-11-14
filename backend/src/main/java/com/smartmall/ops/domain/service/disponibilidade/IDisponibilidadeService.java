package com.smartmall.ops.domain.service.disponibilidade;

import com.smartmall.ops.domain.model.disponibilidade.AusenciaRequest;
import com.smartmall.ops.domain.model.disponibilidade.AusenciaResponse;
import com.smartmall.ops.domain.model.disponibilidade.FuncionarioDisponibilidadeResponse;

import java.util.List;

public interface IDisponibilidadeService {

    /** Funcionários ativos com a situação de hoje, em ordem de nome. */
    List<FuncionarioDisponibilidadeResponse> hoje();

    AusenciaResponse registrarAusencia(AusenciaRequest request, String gestorId);

    /** Volta ao trabalho hoje: ausência que ainda não começou (ou começou hoje) é apagada; a vigente termina ontem. */
    void encerrarAusencia(String id);
}
