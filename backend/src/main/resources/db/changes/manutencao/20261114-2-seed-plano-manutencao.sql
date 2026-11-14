--liquibase formatted sql

-- Planos demonstrativos com início no passado: na inicialização, o backend gera as manutenções
-- desde o início (gerado_ate nulo), o que inclui algumas já atrasadas.
--changeset smartmall:20261114-2-seed-plano-manutencao context:dev
INSERT INTO plano_manutencao (id, data_criacao, equipamento_id, checklist_id, equipe_id, frequencia, intervalo,
                              data_inicio, horario, duracao_minutos, data_fim, observacoes, ativo, gerado_ate)
VALUES ('4c2b0000-0001-4f00-a000-000000000001', NOW(), '5a1e0000-0001-4e00-9000-000000000001',
        '7c3a9e20-0001-4b1d-9c00-000000000001', '3e9a0000-0001-4d00-8000-000000000003', 'SEMANAL', 1,
        CURRENT_DATE - 9, '08:00', 90, NULL, 'Fora do horário de pico.', TRUE, NULL),
       ('4c2b0000-0001-4f00-a000-000000000002', NOW(), '5a1e0000-0001-4e00-9000-000000000004',
        '7c3a9e20-0001-4b1d-9c00-000000000002', '3e9a0000-0001-4d00-8000-000000000001', 'MENSAL', 1,
        CURRENT_DATE + 3, '07:00', 120, NULL, NULL, TRUE, NULL);
