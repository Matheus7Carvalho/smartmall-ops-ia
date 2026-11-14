--liquibase formatted sql

--changeset smartmall:20261113-2-seed-piso context:dev
INSERT INTO piso (id, data_criacao, codigo, nome, ordem)
VALUES ('6f1c0a52-0001-4c1e-9a10-000000000001', NOW(), 'L1', 'Piso L1', 1),
       ('6f1c0a52-0001-4c1e-9a10-000000000002', NOW(), 'L2', 'Piso L2', 2);
