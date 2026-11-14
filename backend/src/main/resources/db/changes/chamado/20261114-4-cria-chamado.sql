--liquibase formatted sql

--changeset smartmall:20261114-4-local-qr
CREATE TABLE local_qr (
    id VARCHAR(36) PRIMARY KEY, data_criacao TIMESTAMP NOT NULL, data_atualizacao TIMESTAMP,
    codigo VARCHAR(60) NOT NULL UNIQUE, nome VARCHAR(100) NOT NULL,
    piso_id VARCHAR(36) NOT NULL REFERENCES piso(id), ativo BOOLEAN NOT NULL
);

--changeset smartmall:20261114-5-chamado
CREATE TABLE chamado (
    id VARCHAR(36) PRIMARY KEY, data_criacao TIMESTAMP NOT NULL, data_atualizacao TIMESTAMP,
    protocolo VARCHAR(20) NOT NULL UNIQUE, chave_envio VARCHAR(36) NOT NULL UNIQUE,
    assinatura VARCHAR(64) NOT NULL, local_qr_id VARCHAR(36) REFERENCES local_qr(id),
    local_informado VARCHAR(150) NOT NULL, descricao VARCHAR(1000) NOT NULL, contato VARCHAR(150),
    status VARCHAR(15) NOT NULL, tipo_sugerido VARCHAR(12) NOT NULL,
    prioridade_sugerida VARCHAR(8) NOT NULL, equipe_sugerida_id VARCHAR(36) REFERENCES equipe(id),
    tipo_confirmado VARCHAR(12), prioridade_confirmada VARCHAR(8),
    equipe_confirmada_id VARCHAR(36) REFERENCES equipe(id), motivo_arquivamento VARCHAR(500),
    CONSTRAINT ck_chamado_status CHECK (status IN ('REGISTRADA','EM_ANALISE','APROVADA','EM_EXECUCAO','ENCERRADA','ARQUIVADA')),
    CONSTRAINT ck_chamado_tipo_sugerido CHECK (tipo_sugerido IN ('PESQUISA','RECLAMACAO','MANUTENCAO','OUTRO')),
    CONSTRAINT ck_chamado_prioridade_sugerida CHECK (prioridade_sugerida IN ('BAIXA','MEDIA','ALTA','CRITICA'))
);
CREATE INDEX ix_chamado_status_criacao ON chamado(status, data_criacao);

--changeset smartmall:20261114-6-plano-acao
CREATE TABLE plano_acao (
    id VARCHAR(36) PRIMARY KEY, data_criacao TIMESTAMP NOT NULL, data_atualizacao TIMESTAMP,
    chamado_id VARCHAR(36) NOT NULL UNIQUE REFERENCES chamado(id)
);
ALTER TABLE tarefa ALTER COLUMN manutencao_programada_id DROP NOT NULL;
ALTER TABLE tarefa DROP CONSTRAINT ck_tarefa_origem;
ALTER TABLE tarefa ADD CONSTRAINT ck_tarefa_origem CHECK (origem IN ('MANUTENCAO_PROGRAMADA','CHAMADO'));
ALTER TABLE tarefa ADD COLUMN plano_acao_id VARCHAR(36) REFERENCES plano_acao(id);
ALTER TABLE tarefa ADD COLUMN equipe_id VARCHAR(36) REFERENCES equipe(id);
ALTER TABLE tarefa ADD COLUMN equipamento_id VARCHAR(36) REFERENCES equipamento(id);
ALTER TABLE tarefa ADD COLUMN checklist_id VARCHAR(36) REFERENCES checklist(id);
ALTER TABLE tarefa ADD COLUMN piso_id VARCHAR(36) REFERENCES piso(id);
ALTER TABLE tarefa ADD COLUMN localizacao VARCHAR(150);
ALTER TABLE tarefa ADD COLUMN duracao_minutos INTEGER;
ALTER TABLE tarefa ADD CONSTRAINT ck_tarefa_origem_vinculo CHECK (
    (origem='MANUTENCAO_PROGRAMADA' AND manutencao_programada_id IS NOT NULL AND plano_acao_id IS NULL)
    OR (origem='CHAMADO' AND plano_acao_id IS NOT NULL AND manutencao_programada_id IS NULL
        AND equipe_id IS NOT NULL AND duracao_minutos BETWEEN 1 AND 1440)
);
CREATE INDEX ix_tarefa_plano_acao ON tarefa(plano_acao_id);

--changeset smartmall:20261114-7-midia-historico
CREATE TABLE chamado_midia (
    id VARCHAR(36) PRIMARY KEY, data_criacao TIMESTAMP NOT NULL, data_atualizacao TIMESTAMP,
    chamado_id VARCHAR(36) NOT NULL UNIQUE REFERENCES chamado(id),
    arquivo_id VARCHAR(36) NOT NULL REFERENCES arquivo(id),
    nome VARCHAR(150) NOT NULL, tipo VARCHAR(30) NOT NULL, tamanho_bytes INTEGER NOT NULL
);
CREATE TABLE chamado_historico (
    id VARCHAR(36) PRIMARY KEY, data_criacao TIMESTAMP NOT NULL, data_atualizacao TIMESTAMP,
    chamado_id VARCHAR(36) NOT NULL REFERENCES chamado(id),
    acao VARCHAR(20) NOT NULL, usuario_id VARCHAR(36) REFERENCES usuario(id),
    data_hora TIMESTAMP NOT NULL, status_resultante VARCHAR(15) NOT NULL, detalhe VARCHAR(500)
);
CREATE INDEX ix_chamado_historico_chamado ON chamado_historico(chamado_id, data_hora);
