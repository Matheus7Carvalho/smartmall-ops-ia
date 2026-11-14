package com.smartmall.ops.domain.model.tarefa;

import com.smartmall.ops.domain.core.model.Resumo;
import com.smartmall.ops.domain.entity.TarefaEvidencia;
import com.smartmall.ops.domain.entity.TarefaHistorico;
import com.smartmall.ops.domain.entity.TarefaItem;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.AcaoTarefa;
import com.smartmall.ops.domain.entity.enums.StatusTarefa;
import com.smartmall.ops.domain.entity.enums.TipoResposta;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/** Tarefa com checklist, evidências e histórico. Inclui o que o usuário atual pode fazer nela. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarefaDetalheResponse {
    private TarefaResponse tarefa;
    private String observacao;
    /** Itens do modelo (antes de assumir, só para consulta) ou do checklist da tarefa (depois). */
    private List<Item> itens;
    private List<Evidencia> evidencias;
    private List<Historico> historico;
    private Acoes acoes;

    public static Resumo resumo(Usuario usuario) {
        return usuario == null ? null : new Resumo(usuario.getId(), usuario.getNome(), null);
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String id;
        private Integer ordem;
        private String pergunta;
        private TipoResposta tipoResposta;
        private Boolean obrigatorio;
        private Integer maxCaracteres;
        private String resposta;

        public static Item de(TarefaItem item) {
            return new Item(item.getId(), item.getOrdem(), item.getPergunta(), item.getTipoResposta(),
                    item.getObrigatorio(), item.getMaxCaracteres(), item.getResposta());
        }
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Evidencia {
        private String id;
        private String nomeArquivo;
        private String tipoConteudo;
        private Integer tamanhoBytes;
        /** Nulo = ainda não enviada para análise. */
        private Integer envio;
        private Resumo enviadaPor;
        private LocalDateTime dataCriacao;

        public static Evidencia de(TarefaEvidencia e) {
            return new Evidencia(e.getId(), e.getNomeArquivo(), e.getTipoConteudo(), e.getTamanhoBytes(), e.getEnvio(),
                    resumo(e.getEnviadaPor()), e.getDataCriacao());
        }
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Historico {
        private String id;
        private AcaoTarefa acao;
        private Resumo usuario;
        private LocalDateTime dataHora;
        private StatusTarefa statusResultante;
        private String observacao;
        private Integer envio;

        public static Historico de(TarefaHistorico h) {
            return new Historico(h.getId(), h.getAcao(), resumo(h.getUsuario()), h.getDataHora(), h.getStatusResultante(),
                    h.getObservacao(), h.getEnvio());
        }
    }

    /** Ações disponíveis para o usuário atual (o servidor valida de novo em cada uma). */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Acoes {
        private boolean assumir;
        /** Preencher checklist, anexar evidências e enviar para análise. */
        private boolean executar;
        /** Aprovar ou reprovar. */
        private boolean avaliar;
    }
}
