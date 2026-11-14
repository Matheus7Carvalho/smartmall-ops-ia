package com.smartmall.ops.domain.service.chamado;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.*;
import com.smartmall.ops.domain.entity.enums.*;
import com.smartmall.ops.domain.model.chamado.*;
import com.smartmall.ops.domain.repository.chamado.*;
import com.smartmall.ops.domain.repository.checklist.ChecklistRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import java.time.*;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChamadoServiceTest {
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 11, 14, 10, 0);
    private static final String CHAVE = "d0f3a684-1b75-4ba9-bde1-8aa502273218";
    @Mock LocalQrRepository locais;
    @Mock ChamadoRepository chamados;
    @Mock ChamadoMidiaRepository midias;
    @Mock ChamadoHistoricoRepository historicos;
    @Mock PlanoAcaoRepository planos;
    @Mock TarefaRepository tarefas;
    @Mock EquipeRepository equipes;
    @Mock EquipamentoRepository equipamentos;
    @Mock ChecklistRepository checklists;
    @Mock UsuarioRepository usuarios;
    ChamadoService service;

    @BeforeEach void preparar() {
        var fuso = ZoneId.of("America/Araguaina");
        service = new ChamadoService(locais, chamados, midias, historicos, planos, tarefas,
                equipes, equipamentos, checklists, usuarios, new TriagemPorRegras(),
                Clock.fixed(AGORA.atZone(fuso).toInstant(), fuso));
    }

    private ChamadoPublicoRequest dados() {
        var r = new ChamadoPublicoRequest();
        r.setDescricao("Vazamento no banheiro"); r.setCodigoLocal("banheiro-norte");
        r.setLocalInformado("Banheiro Norte"); r.setChaveEnvio(CHAVE);
        return r;
    }

    @Test void registroPublicoCriaApenasChamadoParaTriagem() {
        var local = new LocalQr(); local.setCodigo("banheiro-norte");
        when(locais.findByCodigoAndAtivoTrue("banheiro-norte")).thenReturn(Optional.of(local));
        when(chamados.saveAndFlush(any())).thenAnswer(i -> { Chamado c=i.getArgument(0); c.setId("c1"); return c; });

        var resposta = service.registrar(dados(), null, null);

        assertThat(resposta.id()).isEqualTo("c1");
        assertThat(resposta.status()).isEqualTo(StatusChamado.EM_ANALISE);
        assertThat(resposta.protocolo()).startsWith("CH-");
        var captor = ArgumentCaptor.forClass(Chamado.class);
        verify(chamados).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getTipoSugerido()).isEqualTo(TipoChamado.MANUTENCAO);
        assertThat(captor.getValue().getPrioridadeSugerida()).isEqualTo(PrioridadeChamado.ALTA);
        verify(historicos, times(2)).save(any());
        verifyNoInteractions(planos, tarefas);
    }

    @Test void mesmaChaveRetornaMesmoProtocoloSemCriarOutro() {
        var chamado = new Chamado(); chamado.setId("c1"); chamado.setProtocolo("CH-EXISTENTE");
        chamado.setStatus(StatusChamado.EM_ANALISE);
        var local = new LocalQr(); local.setCodigo("banheiro-norte");
        when(locais.findByCodigoAndAtivoTrue("banheiro-norte")).thenReturn(Optional.of(local));
        when(chamados.saveAndFlush(any())).thenAnswer(i -> { Chamado c=i.getArgument(0); c.setId("c1"); return c; });
        service.registrar(dados(), null, null);
        var gravado = ArgumentCaptor.forClass(Chamado.class);
        verify(chamados).saveAndFlush(gravado.capture());
        chamado.setAssinatura(gravado.getValue().getAssinatura());
        when(chamados.findByChaveEnvio(CHAVE)).thenReturn(Optional.of(chamado));

        var repetido = service.registrar(dados(), null, null);

        assertThat(repetido.protocolo()).isEqualTo("CH-EXISTENTE");
        verify(chamados, times(1)).saveAndFlush(any());
    }

    @Test void aprovarCriaPlanoETarefaSomenteDepoisDeRevisao() {
        var chamado = new Chamado(); chamado.setId("c1"); chamado.setStatus(StatusChamado.EM_ANALISE);
        chamado.setLocalInformado("Banheiro Norte");
        when(chamados.findById("c1")).thenReturn(Optional.of(chamado));
        var equipe = new Equipe(); equipe.setId("e1"); equipe.setNome("Manutenção");
        when(equipes.findById("e1")).thenReturn(Optional.of(equipe));
        when(planos.saveAndFlush(any())).thenAnswer(i -> { PlanoAcao p=i.getArgument(0); p.setId("p1"); return p; });
        when(tarefas.saveAndFlush(any())).thenAnswer(i -> { Tarefa t=i.getArgument(0); t.setId("t1"); return t; });
        when(tarefas.findFirstByPlanoAcaoId("p1")).thenReturn(Optional.of(new Tarefa() {{ setId("t1"); }}));
        var r = new AprovarChamadoRequest(); r.setTipo(TipoChamado.MANUTENCAO); r.setPrioridade(PrioridadeChamado.ALTA);
        r.setEquipeId("e1"); r.setDataHoraPrevista(AGORA.plusHours(1)); r.setDuracaoMinutos(30);

        var aprovado = service.aprovar("c1", r, "u1");

        assertThat(aprovado.status()).isEqualTo(StatusChamado.APROVADA);
        assertThat(aprovado.tarefaId()).isEqualTo("t1");
        var tarefa = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefas).saveAndFlush(tarefa.capture());
        assertThat(tarefa.getValue().getOrigem()).isEqualTo(OrigemTarefa.CHAMADO);
        assertThat(tarefa.getValue().getProgramada()).isNull();
        assertThat(tarefa.getValue().getPlanoAcao().getChamado()).isSameAs(chamado);
    }

    @Test void recusaAprovacaoForaDaTriagem() {
        var chamado = new Chamado(); chamado.setStatus(StatusChamado.ARQUIVADA);
        when(chamados.findById("c1")).thenReturn(Optional.of(chamado));
        assertThatThrownBy(() -> service.aprovar("c1", new AprovarChamadoRequest(), "u1"))
                .isInstanceOf(DomainException.class).hasMessageContaining("em análise");
        verifyNoInteractions(planos, tarefas);
    }

    @Test void arquivarRegistraMotivoSemCriarTarefa() {
        var chamado = new Chamado(); chamado.setId("c1"); chamado.setStatus(StatusChamado.EM_ANALISE);
        when(chamados.findById("c1")).thenReturn(Optional.of(chamado));
        var r = new ArquivarChamadoRequest(); r.setMotivo("Relato duplicado");

        var resposta = service.arquivar("c1", r, "u1");

        assertThat(resposta.status()).isEqualTo(StatusChamado.ARQUIVADA);
        assertThat(resposta.motivoArquivamento()).isEqualTo("Relato duplicado");
        verify(historicos).save(any());
        verifyNoInteractions(planos, tarefas);
    }

    @Test void midiaPrivadaExigeChamadoELeBytesSomenteNoDetalhe() {
        var chamado = new Chamado(); chamado.setId("c1");
        when(chamados.findById("c1")).thenReturn(Optional.of(chamado));
        var midia = new ChamadoMidia(); midia.setNome("foto.png"); midia.setTipo("image/png");
        midia.setArquivo(new Arquivo(new byte[]{1,2,3}));
        when(midias.findByChamadoId("c1")).thenReturn(Optional.of(midia));
        assertThat(service.midia("c1").conteudo()).containsExactly(1,2,3);
    }

    @Test void validaAssinaturaDaFotoAntesDeSalvar() {
        var dados = dados();
        byte[] falsa = "conteudo-qualquer".getBytes();

        assertThatThrownBy(() -> service.registrar(dados, "foto.png", falsa))
                .isInstanceOf(DomainException.class).hasMessageContaining("JPG, PNG, WebP");
        verify(chamados, never()).saveAndFlush(any());
        verifyNoInteractions(midias, tarefas, planos);
    }

    @Test void fotoPngValidaFicaEmArquivoPrivado() {
        var local = new LocalQr(); local.setCodigo("banheiro-norte");
        when(locais.findByCodigoAndAtivoTrue("banheiro-norte")).thenReturn(Optional.of(local));
        when(chamados.saveAndFlush(any())).thenAnswer(i -> { Chamado c=i.getArgument(0); c.setId("c1"); return c; });
        byte[] png = new byte[]{(byte)137,80,78,71,13,10,26,10,1,2};

        service.registrar(dados(), "..\\pasta\\foto.png", png);

        var captor = ArgumentCaptor.forClass(ChamadoMidia.class);
        verify(midias).save(captor.capture());
        assertThat(captor.getValue().getNome()).isEqualTo("foto.png");
        assertThat(captor.getValue().getTipo()).isEqualTo("image/png");
        assertThat(captor.getValue().getArquivo().getConteudo()).containsExactly(png);
    }

    @Test void chaveRepetidaComOutroRelatoEhConflito() {
        var existente = new Chamado(); existente.setAssinatura("assinatura-de-outro-payload");
        when(chamados.findByChaveEnvio(CHAVE)).thenReturn(Optional.of(existente));
        assertThatThrownBy(() -> service.registrar(dados(), null, null))
                .isInstanceOf(DomainException.class).hasMessageContaining("outro relato");
        verify(chamados, never()).saveAndFlush(any());
    }
}
