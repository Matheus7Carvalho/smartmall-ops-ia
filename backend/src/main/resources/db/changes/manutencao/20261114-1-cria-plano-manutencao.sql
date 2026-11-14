--liquibase formatted sql

--changeset smartmall:20261114-1-cria-plano-manutencao
CREATE TABLE plano_manutencao
(
    id               VARCHAR(36) NOT NULL,
    data_criacao     TIMESTAMP   NOT NULL,
    data_atualizacao TIMESTAMP,
    equipamento_id   VARCHAR(36) NOT NULL,
    checklist_id     VARCHAR(36) NOT NULL,
    equipe_id        VARCHAR(36) NOT NULL,
    frequencia       VARCHAR(10) NOT NULL,
    intervalo        INTEGER     NOT NULL,
    data_inicio      DATE        NOT NULL,
    horario          TIME        NOT NULL,
    duracao_minutos  INTEGER     NOT NULL,
    data_fim         DATE,
    observacoes      VARCHAR(500),
    ativo            BOOLEAN     NOT NULL DEFAULT TRUE,
    -- Até onde as manutenções já foram geradas. Nulo = nunca gerado.
    gerado_ate       TIMESTAMP,
    CONSTRAINT pk_plano_manutencao PRIMARY KEY (id),
    CONSTRAINT fk_plano_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamento (id),
    CONSTRAINT fk_plano_checklist FOREIGN KEY (checklist_id) REFERENCES checklist (id),
    CONSTRAINT fk_plano_equipe FOREIGN KEY (equipe_id) REFERENCES equipe (id),
    CONSTRAINT ck_plano_frequencia CHECK (frequencia IN ('UNICA', 'DIARIA', 'SEMANAL', 'MENSAL')),
    CONSTRAINT ck_plano_intervalo CHECK (intervalo BETWEEN 1 AND 12),
    CONSTRAINT ck_plano_duracao CHECK (duracao_minutos BETWEEN 15 AND 720),
    CONSTRAINT ck_plano_periodo CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

CREATE TABLE manutencao
(
    id                  VARCHAR(36) NOT NULL,
    data_criacao        TIMESTAMP   NOT NULL,
    data_atualizacao    TIMESTAMP,
    plano_id            VARCHAR(36) NOT NULL,
    data_hora_prevista  TIMESTAMP   NOT NULL,
    status              VARCHAR(12) NOT NULL,
    CONSTRAINT pk_manutencao PRIMARY KEY (id),
    CONSTRAINT fk_manutencao_plano FOREIGN KEY (plano_id) REFERENCES plano_manutencao (id),
    CONSTRAINT uk_manutencao_plano_data UNIQUE (plano_id, data_hora_prevista),
    CONSTRAINT ck_manutencao_status CHECK (status IN ('AGENDADA', 'CANCELADA'))
);

CREATE INDEX ix_manutencao_data ON manutencao (data_hora_prevista);
