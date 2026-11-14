package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Entity @Table(name = "CHAMADO")
public class Chamado extends BaseEntity {
    @Column(name = "PROTOCOLO", nullable = false, length = 20, unique = true)
    private String protocolo;
    @Column(name = "CHAVE_ENVIO", nullable = false, length = 36, unique = true)
    private String chaveEnvio;
    @Column(name = "ASSINATURA", nullable = false, length = 64)
    private String assinatura;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "LOCAL_QR_ID")
    private LocalQr localQr;
    @Column(name = "LOCAL_INFORMADO", nullable = false, length = 150)
    private String localInformado;
    @Column(name = "DESCRICAO", nullable = false, length = 1000)
    private String descricao;
    @Column(name = "CONTATO", length = 150)
    private String contato;
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 15)
    private StatusChamado status;
    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_SUGERIDO", nullable = false, length = 12)
    private TipoChamado tipoSugerido;
    @Enumerated(EnumType.STRING)
    @Column(name = "PRIORIDADE_SUGERIDA", nullable = false, length = 8)
    private PrioridadeChamado prioridadeSugerida;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EQUIPE_SUGERIDA_ID")
    private Equipe equipeSugerida;
    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_CONFIRMADO", length = 12)
    private TipoChamado tipoConfirmado;
    @Enumerated(EnumType.STRING)
    @Column(name = "PRIORIDADE_CONFIRMADA", length = 8)
    private PrioridadeChamado prioridadeConfirmada;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EQUIPE_CONFIRMADA_ID")
    private Equipe equipeConfirmada;
    @Column(name = "MOTIVO_ARQUIVAMENTO", length = 500)
    private String motivoArquivamento;
    @OneToOne(mappedBy = "chamado", fetch = FetchType.LAZY)
    private ChamadoMidia midia;
    @OneToOne(mappedBy = "chamado", fetch = FetchType.LAZY)
    private PlanoAcao planoAcao;
}
