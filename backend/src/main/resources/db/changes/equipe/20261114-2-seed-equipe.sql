--liquibase formatted sql

--changeset smartmall:20261114-2-seed-equipe context:dev
INSERT INTO equipe (id, data_criacao, nome)
VALUES ('3e9a0000-0001-4d00-8000-000000000001', NOW(), 'Climatização'),
       ('3e9a0000-0001-4d00-8000-000000000002', NOW(), 'Hidráulica'),
       ('3e9a0000-0001-4d00-8000-000000000003', NOW(), 'Elevadores e escadas'),
       ('3e9a0000-0001-4d00-8000-000000000004', NOW(), 'Segurança');

-- João Costa (funcionario@smartmall.local) está em Climatização e Elevadores e escadas.
INSERT INTO equipe_membro (equipe_id, usuario_id)
VALUES ('3e9a0000-0001-4d00-8000-000000000001', '2b7d1e10-0001-4a3c-8f00-000000000003'),
       ('3e9a0000-0001-4d00-8000-000000000001', '2b7d1e10-0001-4a3c-8f00-000000000004'),
       ('3e9a0000-0001-4d00-8000-000000000002', '2b7d1e10-0001-4a3c-8f00-000000000005'),
       ('3e9a0000-0001-4d00-8000-000000000003', '2b7d1e10-0001-4a3c-8f00-000000000003'),
       ('3e9a0000-0001-4d00-8000-000000000003', '2b7d1e10-0001-4a3c-8f00-000000000007'),
       ('3e9a0000-0001-4d00-8000-000000000004', '2b7d1e10-0001-4a3c-8f00-000000000006');
