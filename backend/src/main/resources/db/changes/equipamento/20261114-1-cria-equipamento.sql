--liquibase formatted sql

--changeset smartmall:20261114-1-cria-equipamento
CREATE TABLE equipamento
(
    id               VARCHAR(36)  NOT NULL,
    data_criacao     TIMESTAMP    NOT NULL,
    data_atualizacao TIMESTAMP,
    codigo           VARCHAR(20)  NOT NULL,
    nome             VARCHAR(100) NOT NULL,
    categoria        VARCHAR(20)  NOT NULL,
    piso_id          VARCHAR(36)  NOT NULL,
    localizacao      VARCHAR(150) NOT NULL,
    condicao         VARCHAR(12)  NOT NULL,
    CONSTRAINT pk_equipamento PRIMARY KEY (id),
    CONSTRAINT uk_equipamento_codigo UNIQUE (codigo),
    CONSTRAINT fk_equipamento_piso FOREIGN KEY (piso_id) REFERENCES piso (id),
    CONSTRAINT ck_equipamento_categoria CHECK (categoria IN
        ('ELEVADOR', 'ESCADA_ROLANTE', 'CLIMATIZACAO', 'ELETRICA', 'HIDRAULICA', 'SEGURANCA', 'ACESSO', 'OUTROS')),
    CONSTRAINT ck_equipamento_condicao CHECK (condicao IN ('OPERANDO', 'ATENCAO', 'INOPERANTE'))
);
