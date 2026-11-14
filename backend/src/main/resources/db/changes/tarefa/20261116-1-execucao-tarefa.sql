--liquibase formatted sql

-- Execução e validação da tarefa (docs/modulo-manutencao.md, passos 4 e 5).

--changeset smartmall:20261116-1-tarefa-execucao
ALTER TABLE tarefa DROP CONSTRAINT ck_tarefa_status;
ALTER TABLE tarefa ADD CONSTRAINT ck_tarefa_status
    CHECK (status IN ('AGENDADA', 'EM_EXECUCAO', 'EM_ANALISE', 'CONCLUIDA', 'CANCELADA'));
-- Membro da equipe que assumiu a tarefa. Continua o mesmo depois de uma reprovação.
ALTER TABLE tarefa ADD COLUMN responsavel_id VARCHAR(36);
ALTER TABLE tarefa ADD CONSTRAINT fk_tarefa_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuario (id);
ALTER TABLE tarefa ADD COLUMN observacao VARCHAR(500);
-- Quantidade de envios para análise e data do último (ordena a fila de análise).
ALTER TABLE tarefa ADD COLUMN envios INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tarefa ADD COLUMN ultimo_envio TIMESTAMP;
CREATE INDEX ix_tarefa_status ON tarefa (status);

--changeset smartmall:20261116-2-tarefa-item
-- Cópia dos itens do modelo de checklist, feita quando a tarefa é assumida:
-- editar o modelo depois não altera execuções em andamento ou concluídas.
CREATE TABLE tarefa_item
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    tarefa_id        VARCHAR(36)  NOT NULL,
    ordem            INTEGER      NOT NULL,
    pergunta         VARCHAR(200) NOT NULL,
    tipo_resposta    VARCHAR(10)  NOT NULL,
    obrigatorio      BOOLEAN      NOT NULL,
    max_caracteres   INTEGER,
    -- SIM_NAO: 'SIM' ou 'NAO'; NUMERO: número com ponto decimal; TEXTO: até max_caracteres.
    resposta         VARCHAR(500),
    CONSTRAINT pk_tarefa_item PRIMARY KEY (id),
    CONSTRAINT fk_tarefa_item_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefa (id) ON DELETE CASCADE,
    CONSTRAINT ck_tarefa_item_tipo CHECK (tipo_resposta IN ('SIM_NAO', 'TEXTO', 'NUMERO'))
);
CREATE INDEX ix_tarefa_item_tarefa ON tarefa_item (tarefa_id);

--changeset smartmall:20261116-3-arquivo
-- Conteúdo binário separado dos metadados, para que listar evidências não carregue as imagens.
CREATE TABLE arquivo
(
    id               VARCHAR(36) NOT NULL,
    data_criacao     TIMESTAMP   NOT NULL,
    data_atualizacao TIMESTAMP,
    conteudo         BYTEA       NOT NULL,
    CONSTRAINT pk_arquivo PRIMARY KEY (id)
);

--changeset smartmall:20261116-4-tarefa-evidencia
CREATE TABLE tarefa_evidencia
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    tarefa_id        VARCHAR(36)  NOT NULL,
    arquivo_id       VARCHAR(36)  NOT NULL,
    nome_arquivo     VARCHAR(150) NOT NULL,
    tipo_conteudo    VARCHAR(30)  NOT NULL,
    tamanho_bytes    INTEGER      NOT NULL,
    enviada_por_id   VARCHAR(36)  NOT NULL,
    -- Número do envio para análise que levou a evidência. Nulo = ainda não enviada (pode ser removida).
    envio            INTEGER,
    CONSTRAINT pk_tarefa_evidencia PRIMARY KEY (id),
    CONSTRAINT fk_evidencia_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefa (id) ON DELETE CASCADE,
    CONSTRAINT fk_evidencia_arquivo FOREIGN KEY (arquivo_id) REFERENCES arquivo (id),
    CONSTRAINT fk_evidencia_usuario FOREIGN KEY (enviada_por_id) REFERENCES usuario (id)
);
CREATE INDEX ix_tarefa_evidencia_tarefa ON tarefa_evidencia (tarefa_id);

--changeset smartmall:20261116-5-tarefa-historico
-- RNF06: toda mudança de status da tarefa (ação, responsável, data e resultado).
CREATE TABLE tarefa_historico
(
    id               VARCHAR(36) NOT NULL,
    data_criacao     TIMESTAMP   NOT NULL,
    data_atualizacao TIMESTAMP,
    tarefa_id        VARCHAR(36) NOT NULL,
    acao             VARCHAR(20) NOT NULL,
    usuario_id       VARCHAR(36) NOT NULL,
    data_hora        TIMESTAMP   NOT NULL,
    status_resultante VARCHAR(12) NOT NULL,
    observacao       VARCHAR(500),
    envio            INTEGER,
    CONSTRAINT pk_tarefa_historico PRIMARY KEY (id),
    CONSTRAINT fk_historico_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefa (id) ON DELETE CASCADE,
    CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    CONSTRAINT ck_historico_acao CHECK (acao IN ('ASSUMIDA', 'ENVIADA', 'APROVADA', 'REPROVADA', 'CANCELADA', 'RESTAURADA'))
);
CREATE INDEX ix_tarefa_historico_tarefa ON tarefa_historico (tarefa_id);
