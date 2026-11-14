--liquibase formatted sql

-- Elisa Rocha (Segurança) de férias a partir do dia em que a base é criada, registrada pela Supervisora.
--changeset smartmall:20261117-2-seed-ausencia context:dev
INSERT INTO ausencia (id, data_criacao, usuario_id, inicio, fim, motivo, registrada_por_id)
VALUES ('5a1c0000-0001-4e00-9000-000000000001', NOW(), '2b7d1e10-0001-4a3c-8f00-000000000006',
        CURRENT_DATE, CURRENT_DATE + 14, 'FERIAS', '2b7d1e10-0001-4a3c-8f00-000000000002');
