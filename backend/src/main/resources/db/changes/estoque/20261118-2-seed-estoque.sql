--liquibase formatted sql

-- Almoxarifado de demonstração. Saldo = entradas − retiradas abaixo: um item baixo (lâmpada) e um zerado (correia).
-- Entradas registradas pela Supervisora (Ana Souza); retiradas por João Costa e Pedro Lima.
--changeset smartmall:20261118-2-seed-estoque context:dev
INSERT INTO item_estoque (id, data_criacao, codigo, nome, descricao, categoria, unidade, estoque_minimo, localizacao, saldo)
VALUES ('6b2e0000-0001-4f00-a000-000000000001', NOW(), 'FLT-AC-01', 'Filtro de ar-condicionado G4', 'Filtro plissado para fancoil da Ala B.', 'PECA', 'UN', 10, 'Almoxarifado A · Prateleira 2', 26),
       ('6b2e0000-0001-4f00-a000-000000000002', NOW(), 'LMP-LED-18', 'Lâmpada LED tubular 18 W', 'Iluminação de corredores técnicos.', 'CONSUMIVEL', 'UN', 20, 'Almoxarifado A · Prateleira 5', 15),
       ('6b2e0000-0001-4f00-a000-000000000003', NOW(), 'OLE-LUB-01', 'Óleo lubrificante para elevador', NULL, 'CONSUMIVEL', 'L', 5, 'Almoxarifado B · Armário 1', 10),
       ('6b2e0000-0001-4f00-a000-000000000004', NOW(), 'CRR-ECR-02', 'Correia de transmissão — escada rolante', 'Compatível com a escada ECR-02.', 'PECA', 'UN', 2, 'Almoxarifado B · Prateleira 1', 0),
       ('6b2e0000-0001-4f00-a000-000000000005', NOW(), 'LUV-NIT', 'Luva nitrílica', NULL, 'EPI', 'PAR', 30, 'Almoxarifado A · Armário EPI', 80),
       ('6b2e0000-0001-4f00-a000-000000000006', NOW(), 'MUL-DIG', 'Multímetro digital', 'Uso da equipe de elétrica; devolver após o uso.', 'FERRAMENTA', 'UN', 1, 'Sala técnica · Gaveta 3', 3),
       ('6b2e0000-0001-4f00-a000-000000000007', NOW(), 'FUS-30A', 'Fusível 30 A', NULL, 'PECA', 'UN', 10, 'Almoxarifado A · Gaveta 7', 45);

INSERT INTO movimentacao_estoque (id, data_criacao, item_id, tipo, quantidade, saldo_apos, data_hora, usuario_id, equipamento_id, observacao)
VALUES ('6c3f0000-0001-4f00-a000-000000000001', NOW(), '6b2e0000-0001-4f00-a000-000000000001', 'ENTRADA', 30, 30, NOW() - INTERVAL '20 days', '2b7d1e10-0001-4a3c-8f00-000000000002', NULL, 'Compra trimestral'),
       ('6c3f0000-0001-4f00-a000-000000000002', NOW(), '6b2e0000-0001-4f00-a000-000000000001', 'RETIRADA', 4, 26, NOW() - INTERVAL '6 days', '2b7d1e10-0001-4a3c-8f00-000000000003', '5a1e0000-0001-4e00-9000-000000000004', 'Troca preventiva'),
       ('6c3f0000-0001-4f00-a000-000000000003', NOW(), '6b2e0000-0001-4f00-a000-000000000002', 'ENTRADA', 40, 40, NOW() - INTERVAL '25 days', '2b7d1e10-0001-4a3c-8f00-000000000002', NULL, NULL),
       ('6c3f0000-0001-4f00-a000-000000000004', NOW(), '6b2e0000-0001-4f00-a000-000000000002', 'RETIRADA', 25, 15, NOW() - INTERVAL '4 days', '2b7d1e10-0001-4a3c-8f00-000000000004', '5a1e0000-0001-4e00-9000-000000000006', 'Troca no corredor técnico'),
       ('6c3f0000-0001-4f00-a000-000000000005', NOW(), '6b2e0000-0001-4f00-a000-000000000003', 'ENTRADA', 12, 12, NOW() - INTERVAL '30 days', '2b7d1e10-0001-4a3c-8f00-000000000002', NULL, NULL),
       ('6c3f0000-0001-4f00-a000-000000000006', NOW(), '6b2e0000-0001-4f00-a000-000000000003', 'RETIRADA', 2, 10, NOW() - INTERVAL '3 days', '2b7d1e10-0001-4a3c-8f00-000000000003', '5a1e0000-0001-4e00-9000-000000000001', NULL),
       ('6c3f0000-0001-4f00-a000-000000000007', NOW(), '6b2e0000-0001-4f00-a000-000000000004', 'ENTRADA', 2, 2, NOW() - INTERVAL '40 days', '2b7d1e10-0001-4a3c-8f00-000000000002', NULL, NULL),
       ('6c3f0000-0001-4f00-a000-000000000008', NOW(), '6b2e0000-0001-4f00-a000-000000000004', 'RETIRADA', 2, 0, NOW() - INTERVAL '2 days', '2b7d1e10-0001-4a3c-8f00-000000000003', '5a1e0000-0001-4e00-9000-000000000003', 'Correia rompida'),
       ('6c3f0000-0001-4f00-a000-000000000009', NOW(), '6b2e0000-0001-4f00-a000-000000000005', 'ENTRADA', 100, 100, NOW() - INTERVAL '15 days', '2b7d1e10-0001-4a3c-8f00-000000000002', NULL, NULL),
       ('6c3f0000-0001-4f00-a000-000000000010', NOW(), '6b2e0000-0001-4f00-a000-000000000005', 'RETIRADA', 20, 80, NOW() - INTERVAL '1 days', '2b7d1e10-0001-4a3c-8f00-000000000004', NULL, NULL),
       ('6c3f0000-0001-4f00-a000-000000000011', NOW(), '6b2e0000-0001-4f00-a000-000000000006', 'ENTRADA', 3, 3, NOW() - INTERVAL '60 days', '2b7d1e10-0001-4a3c-8f00-000000000002', NULL, NULL),
       ('6c3f0000-0001-4f00-a000-000000000012', NOW(), '6b2e0000-0001-4f00-a000-000000000007', 'ENTRADA', 50, 50, NOW() - INTERVAL '18 days', '2b7d1e10-0001-4a3c-8f00-000000000002', NULL, NULL),
       ('6c3f0000-0001-4f00-a000-000000000013', NOW(), '6b2e0000-0001-4f00-a000-000000000007', 'RETIRADA', 5, 45, NOW() - INTERVAL '5 days', '2b7d1e10-0001-4a3c-8f00-000000000003', '5a1e0000-0001-4e00-9000-000000000007', 'Porta da entrada');
