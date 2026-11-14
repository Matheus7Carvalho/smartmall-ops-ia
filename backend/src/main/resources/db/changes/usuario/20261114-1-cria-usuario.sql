--liquibase formatted sql

--changeset smartmall:20261114-1-cria-usuario
CREATE TABLE usuario
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    nome             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL,
    senha            VARCHAR(100) NOT NULL,
    perfil           VARCHAR(20)  NOT NULL,
    ativo            BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uk_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_perfil CHECK (perfil IN ('ADMINISTRADOR', 'SUPERVISOR', 'FUNCIONARIO'))
);
