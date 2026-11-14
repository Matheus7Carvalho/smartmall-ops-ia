--liquibase formatted sql

-- Nomenclatura do domínio (docs/modulo-manutencao.md, "Glossário"):
--   plano_manutencao -> manutencao_programada (recorrência que gera tarefas)
--   manutencao       -> tarefa (unidade de trabalho; origem: manutenção programada e, no futuro, chamado)

--changeset smartmall:20261115-1-renomeia-manutencao-programada
ALTER TABLE plano_manutencao RENAME TO manutencao_programada;
ALTER TABLE manutencao_programada RENAME CONSTRAINT pk_plano_manutencao TO pk_manutencao_programada;
ALTER TABLE manutencao_programada RENAME CONSTRAINT fk_plano_equipamento TO fk_programada_equipamento;
ALTER TABLE manutencao_programada RENAME CONSTRAINT fk_plano_checklist TO fk_programada_checklist;
ALTER TABLE manutencao_programada RENAME CONSTRAINT fk_plano_equipe TO fk_programada_equipe;
ALTER TABLE manutencao_programada RENAME CONSTRAINT ck_plano_frequencia TO ck_programada_frequencia;
ALTER TABLE manutencao_programada RENAME CONSTRAINT ck_plano_intervalo TO ck_programada_intervalo;
ALTER TABLE manutencao_programada RENAME CONSTRAINT ck_plano_duracao TO ck_programada_duracao;
ALTER TABLE manutencao_programada RENAME CONSTRAINT ck_plano_periodo TO ck_programada_periodo;

--changeset smartmall:20261115-2-renomeia-tarefa
ALTER TABLE manutencao RENAME TO tarefa;
ALTER TABLE tarefa RENAME COLUMN plano_id TO manutencao_programada_id;
ALTER TABLE tarefa RENAME CONSTRAINT pk_manutencao TO pk_tarefa;
ALTER TABLE tarefa RENAME CONSTRAINT fk_manutencao_plano TO fk_tarefa_manutencao_programada;
ALTER TABLE tarefa RENAME CONSTRAINT uk_manutencao_plano_data TO uk_tarefa_programada_data;
ALTER TABLE tarefa RENAME CONSTRAINT ck_manutencao_status TO ck_tarefa_status;
ALTER INDEX ix_manutencao_data RENAME TO ix_tarefa_data;

--changeset smartmall:20261115-3-tarefa-origem
-- Por enquanto toda tarefa vem de uma manutenção programada. CHAMADO entra junto com o módulo de chamados,
-- quando manutencao_programada_id passará a ser opcional.
ALTER TABLE tarefa ADD COLUMN origem VARCHAR(25) NOT NULL DEFAULT 'MANUTENCAO_PROGRAMADA';
ALTER TABLE tarefa ADD CONSTRAINT ck_tarefa_origem CHECK (origem IN ('MANUTENCAO_PROGRAMADA'));
