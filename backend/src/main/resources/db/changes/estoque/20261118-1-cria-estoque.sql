--liquibase formatted sql

--changeset smartmall:20261118-1-cria-estoque
CREATE TABLE item_estoque
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    codigo           VARCHAR(20)  NOT NULL,
    nome             VARCHAR(100) NOT NULL,
    descricao        VARCHAR(500),
    categoria        VARCHAR(15)  NOT NULL,
    unidade          VARCHAR(5)   NOT NULL,
    estoque_minimo   INTEGER      NOT NULL,
    localizacao      VARCHAR(100),
    saldo            INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT pk_item_estoque PRIMARY KEY (id),
    CONSTRAINT uk_item_estoque_codigo UNIQUE (codigo),
    CONSTRAINT ck_item_estoque_saldo CHECK (saldo >= 0),
    CONSTRAINT ck_item_estoque_minimo CHECK (estoque_minimo >= 0)
);

CREATE TABLE movimentacao_estoque
(
    id               VARCHAR(36) NOT NULL,
    data_criacao     TIMESTAMP   NOT NULL,
    data_atualizacao TIMESTAMP,
    item_id          VARCHAR(36) NOT NULL,
    tipo             VARCHAR(10) NOT NULL,
    quantidade       INTEGER     NOT NULL,
    saldo_apos       INTEGER     NOT NULL,
    data_hora        TIMESTAMP   NOT NULL,
    usuario_id       VARCHAR(36) NOT NULL,
    equipamento_id   VARCHAR(36),
    observacao       VARCHAR(200),
    CONSTRAINT pk_movimentacao_estoque PRIMARY KEY (id),
    CONSTRAINT fk_movimentacao_item FOREIGN KEY (item_id) REFERENCES item_estoque (id),
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    CONSTRAINT fk_movimentacao_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamento (id),
    CONSTRAINT ck_movimentacao_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_movimentacao_saldo CHECK (saldo_apos >= 0)
);

CREATE INDEX ix_movimentacao_item_data ON movimentacao_estoque (item_id, data_hora);
CREATE INDEX ix_movimentacao_data ON movimentacao_estoque (data_hora);
CREATE INDEX ix_movimentacao_equipamento ON movimentacao_estoque (equipamento_id);
