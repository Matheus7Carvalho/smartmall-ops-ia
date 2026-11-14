package com.smartmall.ops.domain.service.chamado;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.ChamadoHistorico;
import com.smartmall.ops.domain.entity.Tarefa;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import com.smartmall.ops.domain.repository.chamado.ChamadoHistoricoRepository;
import com.smartmall.ops.domain.repository.chamado.ChamadoRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class CicloChamadoService {
    private final ChamadoRepository chamados;
    private final ChamadoHistoricoRepository historicos;
    private final UsuarioRepository usuarios;
    private final Clock clock;

    public CicloChamadoService(ChamadoRepository chamados, ChamadoHistoricoRepository historicos,
                               UsuarioRepository usuarios, Clock clock) {
        this.chamados = chamados; this.historicos = historicos; this.usuarios = usuarios; this.clock = clock;
    }

    public void iniciada(Tarefa tarefa, String usuarioId) {
        if (tarefa.getPlanoAcao() == null) return;
        var chamado = tarefa.getPlanoAcao().getChamado();
        if (chamado.getStatus() == StatusChamado.APROVADA) {
            chamado.setStatus(StatusChamado.EM_EXECUCAO);
            historico(chamado, "INICIADA", usuarioId, null);
        }
    }

    public void encerrada(Tarefa tarefa, String usuarioId) {
        if (tarefa.getPlanoAcao() == null) return;
        if (tarefa.getObservacao() == null || tarefa.getObservacao().isBlank())
            throw new DomainException("Registre a resolução antes de encerrar o chamado.");
        var chamado = tarefa.getPlanoAcao().getChamado();
        if (chamado.getStatus() != StatusChamado.EM_EXECUCAO)
            throw new DomainException("O chamado não está em execução.");
        chamado.setStatus(StatusChamado.ENCERRADA);
        historico(chamado, "ENCERRADA", usuarioId, tarefa.getObservacao());
    }

    private void historico(com.smartmall.ops.domain.entity.Chamado chamado, String acao, String usuarioId, String detalhe) {
        chamados.save(chamado);
        var h = new ChamadoHistorico();
        h.setChamado(chamado);
        h.setAcao(acao);
        h.setUsuario(usuarios.getReferenceById(usuarioId));
        h.setDataHora(LocalDateTime.now(clock));
        h.setStatusResultante(chamado.getStatus());
        h.setDetalhe(detalhe);
        historicos.save(h);
    }
}
