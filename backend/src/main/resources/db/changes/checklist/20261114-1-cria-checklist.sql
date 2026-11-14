--liquibase formatted sql

--changeset smartmall:20261114-1-cria-checklist
CREATE TABLE checklist
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    nome             VARCHAR(100) NOT NULL,
    CONSTRAINT pk_checklist PRIMARY KEY (id)
);

CREATE TABLE checklist_item
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    checklist_id     VARCHAR(36)  NOT NULL,
    ordem            INTEGER      NOT NULL,
    pergunta         VARCHAR(200) NOT NULL,
    tipo_resposta    VARCHAR(10)  NOT NULL,
    obrigatorio      BOOLEAN      NOT NULL DEFAULT TRUE,
    max_caracteres   INTEGER,
    CONSTRAINT pk_checklist_item PRIMARY KEY (id),
    CONSTRAINT fk_checklist_item_checklist FOREIGN KEY (checklist_id) REFERENCES checklist (id) ON DELETE CASCADE,
    CONSTRAINT ck_checklist_item_tipo CHECK (tipo_resposta IN ('SIM_NAO', 'TEXTO', 'NUMERO')),
    -- Máximo de caracteres só existe para TEXTO, entre 1 e 500.
    CONSTRAINT ck_checklist_item_max CHECK (
        (tipo_resposta = 'TEXTO' AND max_caracteres BETWEEN 1 AND 500)
            OR (tipo_resposta <> 'TEXTO' AND max_caracteres IS NULL))
);

CREATE INDEX ix_checklist_item_checklist ON checklist_item (checklist_id, ordem);
