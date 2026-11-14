package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.OrigemTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Unidade de trabalho. Hoje gerada por uma manutenção programada; no futuro, também pelo plano de ação de um chamado. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "TAREFA")
public class Tarefa extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MANUTENCAO_PROGRAMADA_ID")
    private ManutencaoProgramada programada;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PLANO_ACAO_ID")
    private PlanoAcao planoAcao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EQUIPE_ID")
    private Equipe equipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EQUIPAMENTO_ID")
    private Equipamento equipamento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CHECKLIST_ID")
    private Checklist checklist;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PISO_ID")
    private Piso piso;

    @Column(name = "LOCALIZACAO", length = 150)
    private String localizacao;

    @Column(name = "DURACAO_MINUTOS")
    private Integer duracaoMinutos;

    @Column(name = "DATA_HORA_PREVISTA", nullable = false)
    private LocalDateTime dataHoraPrevista;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 12)
    private StatusTarefa status;

    @Enumerated(EnumType.STRING)
    @Column(name = "ORIGEM", nullable = false, length = 25)
    private OrigemTarefa origem;

    /** Membro da equipe que assumiu a tarefa. Continua o mesmo depois de uma reprovação. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "RESPONSAVEL_ID")
    private Usuario responsavel;

    /** Observação do responsável sobre a execução. */
    @Column(name = "OBSERVACAO", length = 500)
    private String observacao;

    @Column(name = "ENVIOS", nullable = false)
    private Integer envios = 0;

    @Column(name = "ULTIMO_ENVIO")
    private LocalDateTime ultimoEnvio;

    /** Checklist da execução, copiado do modelo quando a tarefa é assumida. */
    @OneToMany(mappedBy = "tarefa", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<TarefaItem> itens = new ArrayList<>();

    @OneToMany(mappedBy = "tarefa", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dataHora ASC")
    private List<TarefaHistorico> historico = new ArrayList<>();

    public Tarefa(ManutencaoProgramada programada, LocalDateTime dataHoraPrevista) {
        this.programada = programada;
        this.dataHoraPrevista = dataHoraPrevista;
        this.status = StatusTarefa.AGENDADA;
        this.origem = OrigemTarefa.MANUTENCAO_PROGRAMADA;
    }

    public Tarefa(PlanoAcao planoAcao, Equipe equipe, Equipamento equipamento, Checklist checklist,
                  Piso piso, String localizacao, LocalDateTime dataHoraPrevista, int duracaoMinutos) {
        this.planoAcao = planoAcao;
        this.equipe = equipe;
        this.equipamento = equipamento;
        this.checklist = checklist;
        this.piso = piso;
        this.localizacao = localizacao;
        this.dataHoraPrevista = dataHoraPrevista;
        this.duracaoMinutos = duracaoMinutos;
        this.status = StatusTarefa.AGENDADA;
        this.origem = OrigemTarefa.CHAMADO;
    }

    public Equipe equipeEfetiva() { return programada == null ? equipe : programada.getEquipe(); }
    public Equipamento equipamentoEfetivo() { return programada == null ? equipamento : programada.getEquipamento(); }
    public Checklist checklistEfetivo() { return programada == null ? checklist : programada.getChecklist(); }
    public Integer duracaoEfetiva() { return programada == null ? duracaoMinutos : programada.getDuracaoMinutos(); }

    /** Agendada com data e hora já passadas. */
    public boolean isAtrasada(LocalDateTime agora) {
        return status == StatusTarefa.AGENDADA && dataHoraPrevista.isBefore(agora);
    }

    /** Muda o status e grava o registro no histórico (RNF06). */
    public TarefaHistorico mudarStatus(StatusTarefa novo, AcaoTarefa acao, Usuario usuario, LocalDateTime quando, String observacao) {
        this.status = novo;
        var registro = new TarefaHistorico();
        registro.setTarefa(this);
        registro.setAcao(acao);
        registro.setUsuario(usuario);
        registro.setDataHora(quando);
        registro.setStatusResultante(novo);
        registro.setObservacao(observacao);
        historico.add(registro);
        return registro;
    }
}
