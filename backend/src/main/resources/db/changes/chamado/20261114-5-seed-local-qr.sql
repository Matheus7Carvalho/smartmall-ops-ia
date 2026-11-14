--liquibase formatted sql

--changeset smartmall:20261114-8-seed-local-qr context:dev
INSERT INTO local_qr (id, data_criacao, codigo, nome, piso_id, ativo) VALUES
('6f1c0a52-0002-4c1e-9a10-000000000001', NOW(), 'banheiro-norte', 'Banheiro Norte', '6f1c0a52-0001-4c1e-9a10-000000000001', TRUE),
('6f1c0a52-0002-4c1e-9a10-000000000002', NOW(), 'praca-alimentacao', 'Praça de Alimentação', '6f1c0a52-0001-4c1e-9a10-000000000002', TRUE),
('6f1c0a52-0002-4c1e-9a10-000000000003', NOW(), 'entrada', 'Entrada Principal', '6f1c0a52-0001-4c1e-9a10-000000000001', TRUE);
