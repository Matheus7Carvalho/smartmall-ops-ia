--liquibase formatted sql

--changeset smartmall:20261117-1-cria-ausencia
CREATE TABLE ausencia
(
    id                VARCHAR(36) NOT NULL,
    data_criacao      TIMESTAMP   NOT NULL,
    data_atualizacao  TIMESTAMP,
    usuario_id        VARCHAR(36) NOT NULL,
    inicio            DATE        NOT NULL,
    fim               DATE        NOT NULL,
    motivo            VARCHAR(15) NOT NULL,
    registrada_por_id VARCHAR(36) NOT NULL,
    CONSTRAINT pk_ausencia PRIMARY KEY (id),
    CONSTRAINT fk_ausencia_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
    CONSTRAINT fk_ausencia_registrada_por FOREIGN KEY (registrada_por_id) REFERENCES usuario (id),
    CONSTRAINT ck_ausencia_periodo CHECK (fim >= inicio)
);

CREATE INDEX ix_ausencia_usuario_periodo ON ausencia (usuario_id, inicio, fim);
