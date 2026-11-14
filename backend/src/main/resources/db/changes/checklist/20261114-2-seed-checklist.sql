--liquibase formatted sql

-- Checklists demonstrativos, baseados no protótipo. Não substituem procedimentos técnicos aprovados.
--changeset smartmall:20261114-2-seed-checklist context:dev
INSERT INTO checklist (id, data_criacao, nome)
VALUES ('7c3a9e20-0001-4b1d-9c00-000000000001', NOW(), 'Elevador — inspeção preventiva'),
       ('7c3a9e20-0001-4b1d-9c00-000000000002', NOW(), 'Ar-condicionado — revisão mensal');

INSERT INTO checklist_item (id, data_criacao, checklist_id, ordem, pergunta, tipo_resposta, obrigatorio, max_caracteres)
VALUES ('7c3a9e20-0002-4b1d-9c00-000000000001', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000001', 1, 'Sistema de tração inspecionado?', 'SIM_NAO', TRUE, NULL),
       ('7c3a9e20-0002-4b1d-9c00-000000000002', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000001', 2, 'Cabos e freios em condição normal?', 'SIM_NAO', TRUE, NULL),
       ('7c3a9e20-0002-4b1d-9c00-000000000003', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000001', 3, 'Portas e sensores funcionando?', 'SIM_NAO', TRUE, NULL),
       ('7c3a9e20-0002-4b1d-9c00-000000000004', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000001', 4, 'Desnível na parada (mm)', 'NUMERO', TRUE, NULL),
       ('7c3a9e20-0002-4b1d-9c00-000000000005', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000001', 5, 'Observações', 'TEXTO', FALSE, 500),
       ('7c3a9e20-0002-4b1d-9c00-000000000006', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000002', 1, 'Filtro limpo ou substituído?', 'SIM_NAO', TRUE, NULL),
       ('7c3a9e20-0002-4b1d-9c00-000000000007', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000002', 2, 'Temperatura de insuflamento (°C)', 'NUMERO', TRUE, NULL),
       ('7c3a9e20-0002-4b1d-9c00-000000000008', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000002', 3, 'Ruído ou vibração anormal?', 'SIM_NAO', TRUE, NULL),
       ('7c3a9e20-0002-4b1d-9c00-000000000009', NOW(), '7c3a9e20-0001-4b1d-9c00-000000000002', 4, 'Peças substituídas', 'TEXTO', FALSE, 200);
