--liquibase formatted sql

--changeset smartmall:20261114-1-cria-equipe
CREATE TABLE equipe
(
    id               VARCHAR(36) NOT NULL,
    data_criacao     TIMESTAMP   NOT NULL,
    data_atualizacao TIMESTAMP,
    nome             VARCHAR(60) NOT NULL,
    CONSTRAINT pk_equipe PRIMARY KEY (id),
    CONSTRAINT uk_equipe_nome UNIQUE (nome)
);

CREATE TABLE equipe_membro
(
    equipe_id  VARCHAR(36) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    CONSTRAINT pk_equipe_membro PRIMARY KEY (equipe_id, usuario_id),
    CONSTRAINT fk_equipe_membro_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id) ON DELETE CASCADE,
    CONSTRAINT fk_equipe_membro_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);

CREATE INDEX ix_equipe_membro_usuario ON equipe_membro (usuario_id);
