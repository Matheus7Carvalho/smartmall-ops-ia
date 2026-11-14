--liquibase formatted sql

-- Funcionários demonstrativos do protótipo, para compor as equipes. Senha: demo123.
--changeset smartmall:20261114-3-seed-funcionarios context:dev
INSERT INTO usuario (id, data_criacao, nome, email, senha, perfil, ativo)
VALUES ('2b7d1e10-0001-4a3c-8f00-000000000004', NOW(), 'Pedro Lima', 'pedro.lima@smartmall.local',
        '$2a$10$Sv6PEjrPDPtkzxombJkbSO5RwpavlyeaB30ZpRKg0t0s83ra0iU1a', 'FUNCIONARIO', TRUE),
       ('2b7d1e10-0001-4a3c-8f00-000000000005', NOW(), 'Luana Freitas', 'luana.freitas@smartmall.local',
        '$2a$10$Sv6PEjrPDPtkzxombJkbSO5RwpavlyeaB30ZpRKg0t0s83ra0iU1a', 'FUNCIONARIO', TRUE),
       ('2b7d1e10-0001-4a3c-8f00-000000000006', NOW(), 'Elisa Rocha', 'elisa.rocha@smartmall.local',
        '$2a$10$Sv6PEjrPDPtkzxombJkbSO5RwpavlyeaB30ZpRKg0t0s83ra0iU1a', 'FUNCIONARIO', TRUE),
       ('2b7d1e10-0001-4a3c-8f00-000000000007', NOW(), 'Caio Nunes', 'caio.nunes@smartmall.local',
        '$2a$10$Sv6PEjrPDPtkzxombJkbSO5RwpavlyeaB30ZpRKg0t0s83ra0iU1a', 'FUNCIONARIO', TRUE);
