--liquibase formatted sql

-- Equipamentos demonstrativos do protótipo (só os dos pisos cadastrados, L1 e L2).
--changeset smartmall:20261114-2-seed-equipamento context:dev
INSERT INTO equipamento (id, data_criacao, codigo, nome, categoria, piso_id, localizacao, condicao)
VALUES ('5a1e0000-0001-4e00-9000-000000000001', NOW(), 'ELV-E1', 'Elevador E1', 'ELEVADOR', '6f1c0a52-0001-4c1e-9a10-000000000001', 'Praça Central', 'OPERANDO'),
       ('5a1e0000-0001-4e00-9000-000000000002', NOW(), 'ELV-E2', 'Elevador E2', 'ELEVADOR', '6f1c0a52-0001-4c1e-9a10-000000000001', 'Praça Central', 'ATENCAO'),
       ('5a1e0000-0001-4e00-9000-000000000003', NOW(), 'ECR-02', 'Escada rolante ECR-02', 'ESCADA_ROLANTE', '6f1c0a52-0001-4c1e-9a10-000000000001', 'Conexão entre L1 e L2', 'OPERANDO'),
       ('5a1e0000-0001-4e00-9000-000000000004', NOW(), 'HVAC-B', 'Ar-condicionado — Ala B', 'CLIMATIZACAO', '6f1c0a52-0001-4c1e-9a10-000000000002', 'Ala B', 'OPERANDO'),
       ('5a1e0000-0001-4e00-9000-000000000005', NOW(), 'BOM-B01', 'Bomba hidráulica B01', 'HIDRAULICA', '6f1c0a52-0001-4c1e-9a10-000000000001', 'Casa de bombas', 'OPERANDO'),
       ('5a1e0000-0001-4e00-9000-000000000006', NOW(), 'ILU-EMG', 'Iluminação de emergência', 'ELETRICA', '6f1c0a52-0001-4c1e-9a10-000000000001', 'Corredor técnico', 'OPERANDO'),
       ('5a1e0000-0001-4e00-9000-000000000007', NOW(), 'POR-ENT', 'Porta automática — Entrada principal', 'ACESSO', '6f1c0a52-0001-4c1e-9a10-000000000001', 'Entrada principal', 'INOPERANTE'),
       ('5a1e0000-0001-4e00-9000-000000000008', NOW(), 'CFTV-L2', 'Câmeras CFTV — Piso L2', 'SEGURANCA', '6f1c0a52-0001-4c1e-9a10-000000000002', 'Corredor', 'OPERANDO');
