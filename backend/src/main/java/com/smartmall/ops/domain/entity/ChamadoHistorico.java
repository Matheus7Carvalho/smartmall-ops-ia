package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter @Entity @Table(name = "CHAMADO_HISTORICO")
public class ChamadoHistorico extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CHAMADO_ID", nullable = false)
    private Chamado chamado;
    @Column(name = "ACAO", nullable = false, length = 20)
    private String acao;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "USUARIO_ID")
    private Usuario usuario;
    @Column(name = "DATA_HORA", nullable = false)
    private LocalDateTime dataHora;
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS_RESULTANTE", nullable = false, length = 15)
    private StatusChamado statusResultante;
    @Column(name = "DETALHE", length = 500)
    private String detalhe;
}
