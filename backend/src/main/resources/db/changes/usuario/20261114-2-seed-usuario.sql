--liquibase formatted sql

-- Usuários de demonstração. Senha de todos: demo123 (hash BCrypt).
--changeset smartmall:20261114-2-seed-usuario context:dev
INSERT INTO usuario (id, data_criacao, nome, email, senha, perfil, ativo)
VALUES ('2b7d1e10-0001-4a3c-8f00-000000000001', NOW(), 'Rafael Mendes', 'admin@smartmall.local',
        '$2a$10$Sv6PEjrPDPtkzxombJkbSO5RwpavlyeaB30ZpRKg0t0s83ra0iU1a', 'ADMINISTRADOR', TRUE),
       ('2b7d1e10-0001-4a3c-8f00-000000000002', NOW(), 'Ana Souza', 'supervisor@smartmall.local',
        '$2a$10$Sv6PEjrPDPtkzxombJkbSO5RwpavlyeaB30ZpRKg0t0s83ra0iU1a', 'SUPERVISOR', TRUE),
       ('2b7d1e10-0001-4a3c-8f00-000000000003', NOW(), 'João Costa', 'funcionario@smartmall.local',
        '$2a$10$Sv6PEjrPDPtkzxombJkbSO5RwpavlyeaB30ZpRKg0t0s83ra0iU1a', 'FUNCIONARIO', TRUE);
