package com.smartmall.ops.domain.model.chamado;

import com.smartmall.ops.domain.entity.enums.*;
import java.time.LocalDateTime;
import java.util.List;

public record ChamadoResponse(String id, String protocolo, StatusChamado status, String descricao,
                              String localQrCodigo, String localQrNome, String localInformado, String contato,
                              TipoChamado tipoSugerido, PrioridadeChamado prioridadeSugerida, String equipeSugeridaId,
                              TipoChamado tipoConfirmado, PrioridadeChamado prioridadeConfirmada, String equipeConfirmadaId,
                              LocalDateTime criadoEm, Midia midia, String tarefaId, String motivoArquivamento,
                              List<Historico> historico) {
    public record Midia(String id, String nome, String tipo, Integer tamanhoBytes) { }
    public record Historico(String acao, String usuarioId, LocalDateTime dataHora,
                            StatusChamado statusResultante, String detalhe) { }
}
