--liquibase formatted sql

--changeset smartmall:20261113-1-cria-piso
CREATE TABLE piso
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    codigo           VARCHAR(10)  NOT NULL,
    nome             VARCHAR(100) NOT NULL,
    ordem            INTEGER      NOT NULL,
    CONSTRAINT pk_piso PRIMARY KEY (id),
    CONSTRAINT uk_piso_codigo UNIQUE (codigo)
);
