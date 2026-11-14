package com.smartmall.ops.domain.service.tarefa;

import com.smartmall.ops.domain.model.tarefa.ArquivoEvidencia;
import com.smartmall.ops.domain.model.tarefa.Ator;
import com.smartmall.ops.domain.model.tarefa.AvaliacaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.ExecucaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.TarefaDetalheResponse;
import com.smartmall.ops.domain.model.tarefa.TarefaResponse;

import java.util.List;

/** Execução (responsável) e validação (Administrador/Supervisor) da tarefa. Regras em docs/modulo-manutencao.md. */
public interface IExecucaoTarefaService {

    TarefaDetalheResponse detalhe(String id, Ator ator);

    /** Fila de análise, o envio mais antigo primeiro. */
    List<TarefaResponse> emAnalise();

    TarefaDetalheResponse assumir(String id, Ator ator);

    /** Salva respostas e observação sem enviar. */
    TarefaDetalheResponse salvar(String id, ExecucaoTarefaRequest request, Ator ator);

    TarefaDetalheResponse adicionarEvidencia(String id, String nomeArquivo, byte[] conteudo, Ator ator);

    TarefaDetalheResponse removerEvidencia(String id, String evidenciaId, Ator ator);

    ArquivoEvidencia arquivo(String id, String evidenciaId, Ator ator);

    /** Salva e envia para análise. */
    TarefaDetalheResponse enviar(String id, ExecucaoTarefaRequest request, Ator ator);

    TarefaDetalheResponse aprovar(String id, AvaliacaoTarefaRequest request, Ator ator);

    TarefaDetalheResponse reprovar(String id, AvaliacaoTarefaRequest request, Ator ator);
}
